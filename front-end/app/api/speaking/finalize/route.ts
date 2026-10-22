import { NextResponse } from 'next/server';
import { z } from 'zod';
import { summarizeSpeaking } from '@/lib/scoring/scale';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase } from '@/lib/supabase-server';

/** `limit`: client báo có câu bị bỏ vì API chấm trả 429, chỉ để ghi lý do vào `scoring_error`. */
const bodySchema = z.object({ attemptId: z.uuid(), limit: z.enum(['daily_limit', 'provider_limit']).nullish() });

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Nộp bài Speaking của người đăng nhập: tính tổng 0–200 từ điểm từng câu rồi đóng attempt (`scored`). */
export async function POST(request: Request) {
    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return fail('invalid_body', 400);
    const { attemptId, limit = null } = body.data;

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    const userId = auth?.claims.sub;
    if (!userId) return fail('unauthorized', 401);

    const { data: attempt, error: attemptError } = await supabase
        .from('attempts')
        .select('exam_id')
        .eq('id', attemptId)
        .eq('user_id', userId)
        .eq('status', 'in_progress')
        .maybeSingle();
    if (attemptError) return fail('server_error', 500);
    if (!attempt) return fail('attempt_not_found', 404);

    const [questions, responses] = await Promise.all([
        supabase.from('questions').select('id, number, exam_parts!inner(exam_id)').eq('exam_parts.exam_id', attempt.exam_id),
        supabase.from('responses').select('question_id, score, feedback').eq('attempt_id', attemptId),
    ]);
    if (questions.error || responses.error) return fail('server_error', 500);

    const summary = summarizeSpeaking(questions.data, responses.data, limit);
    const now = new Date().toISOString();
    const { error } = await createAdminSupabase()
        .from('attempts')
        .update({
            status: 'scored',
            submitted_at: now,
            scored_at: now,
            score: summary.score,
            feedback_summary: summary.feedbackSummary,
            scoring_error: summary.scoringError,
        })
        .eq('id', attemptId);
    if (error) return fail('server_error', 500);

    return NextResponse.json({ score: summary.score });
}
