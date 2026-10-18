import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import { ProviderQuotaError } from '@/lib/scoring/errors';
import { InvalidAudioError, scoreAnswer } from '@/lib/scoring/score';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';

/** WAV 16 kHz 45s ≈ 1,4 MB; WebM 60s vài trăm KB. */
const MAX_AUDIO_BYTES = 5 * 1024 * 1024;
/** Số câu được chấm mỗi ngày: khách 3 bài, người đăng nhập 5 bài (11 câu/bài). */
const DAILY_LIMIT = { guest: 33, user: 55 };

const fieldsSchema = z.object({ questionId: z.uuid(), attemptId: z.uuid() });

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Chấm một câu Speaking. Audio chỉ nằm trong RAM của request rồi bỏ.
 * Người đăng nhập: ghi điểm vào `responses` (service_role). Khách: chỉ trả kết quả, client lưu localStorage.
 */
export async function POST(request: Request) {
    const form = await request.formData().catch(() => null);
    const audio = form?.get('audio');
    const fields = fieldsSchema.safeParse({ questionId: form?.get('questionId'), attemptId: form?.get('attemptId') });
    if (!fields.success || !(audio instanceof Blob) || audio.size === 0 || audio.size > MAX_AUDIO_BYTES) {
        return fail('invalid_body', 400);
    }
    const { questionId, attemptId } = fields.data;

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    const userId = auth?.claims.sub ?? null;

    // Client mang phiên: RLS chỉ trả câu của đề đã phát hành (hoặc đề nháp với admin)
    const { data: question, error: questionError } = await supabase
        .from('questions')
        .select('number, prompt, image_alt, exam_parts!inner(exam_id, context, part_template_id)')
        .eq('id', questionId)
        .maybeSingle();
    if (questionError) return fail('server_error', 500);
    const template = PART_TEMPLATES.find((item) => item.id === question?.exam_parts.part_template_id);
    if (!question || template?.skill !== 'speaking') return fail('question_not_found', 404);

    if (userId) {
        const { data: attempt, error } = await supabase
            .from('attempts')
            .select('id')
            .eq('id', attemptId)
            .eq('user_id', userId)
            .eq('exam_id', question.exam_parts.exam_id)
            .eq('status', 'in_progress')
            .maybeSingle();
        if (error) return fail('server_error', 500);
        if (!attempt) return fail('attempt_not_found', 404);
    }

    const admin = createAdminSupabase();
    // shortcut: IP băm sha256 không muối, đủ để không lưu IP thô; thêm secret salt nếu cần chống dò ngược
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const subject = userId ? `user:${userId}` : `ip:${createHash('sha256').update(ip).digest('hex')}`;
    const { data: allowed, error: quotaError } = await admin.rpc('consume_scoring_quota', {
        p_subject: subject,
        p_limit: userId ? DAILY_LIMIT.user : DAILY_LIMIT.guest,
    });
    if (quotaError) return fail('server_error', 500);
    if (!allowed) return fail('daily_limit', 429);
    /** Chấm/lưu lỗi thì trả lại lượt, để client thử lại khi nộp bài không bị trừ thêm. */
    const refund = async (error: string, status: number) => {
        const { error: refundError } = await admin.rpc('refund_scoring_quota', { p_subject: subject });
        if (refundError) console.error('Scoring quota refund failed', refundError);
        return fail(error, status);
    };

    let result;
    try {
        result = await scoreAnswer(
            {
                number: question.number,
                partNo: template.part_no,
                task: template.task,
                prompt: question.prompt,
                context: question.exam_parts.context,
                imageAlt: question.image_alt,
            },
            audio,
        );
    } catch (error) {
        if (error instanceof InvalidAudioError) return refund('invalid_audio', 400);
        if (error instanceof ProviderQuotaError) return refund('provider_limit', 429);
        console.error('Speaking scoring failed', error);
        return refund('scoring_failed', 502);
    }

    if (userId) {
        const { error } = await admin
            .from('responses')
            .upsert({ attempt_id: attemptId, question_id: questionId, ...result }, { onConflict: 'attempt_id,question_id' });
        if (error) return refund('server_error', 500);
    }
    return NextResponse.json(result);
}
