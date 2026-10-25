import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
    canChangeStatus,
    findPublishIssues,
    MAX_NOTE_LENGTH,
    needsNote,
} from '@/app/exam-management/_lib/examStatus';
import { getExam } from '@/lib/data/content';
import { getExamRoom } from '@/lib/exam-library/room';
import { expireExamSummaries } from '@/lib/exam-library/summaries';
import { serverError } from '@/lib/logger';
import { createServerSupabase, isAdmin } from '@/lib/supabase-server';

const bodySchema = z.object({
    status: z.enum(['draft', 'review', 'published', 'archived']),
    note: z.string().trim().max(MAX_NOTE_LENGTH).optional(),
});

const fail = (error: string, status: number, extra?: object) => NextResponse.json({ error, ...extra }, { status });

/**
 * Chuyển trạng thái đề theo `examStatus.ts`: trả về nháp phải có lý do, phát hành phải đủ
 * dữ liệu. Ghi bằng phiên admin: RLS chặn người khác (không đọc được đề nháp, cập nhật 0 dòng).
 */
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) return fail('not_found', 404);

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims.sub) return fail('unauthorized', 401);
    if (!(await isAdmin(supabase, auth.claims.sub))) return fail('forbidden', 403);

    const body = bodySchema.safeParse(await request.json().catch(() => null));
    if (!body.success) return fail('invalid_body', 400);
    const { status, note } = body.data;

    const exam = await getExam(id.data, supabase).catch((error: unknown) =>
        serverError('exam status: load exam failed', error, { examId: id.data }),
    );
    if (exam instanceof Response) return exam;
    if (!exam) return fail('not_found', 404);
    // `exam_stats` chỉ trả dòng cho admin; không có dòng = chưa ai làm
    const { data: stats, error: statsError } = await supabase
        .from('exam_stats')
        .select('attempt_count')
        .eq('exam_id', exam.id)
        .maybeSingle();
    if (statsError) return serverError('exam status: load stats failed', statsError, { examId: exam.id });
    if (!canChangeStatus(exam.status, status, stats?.attempt_count ?? 0)) return fail('invalid_transition', 409);
    if (needsNote(status) && !note) return fail('note_required', 400);

    if (status === 'published') {
        const room = await getExamRoom(exam.skill, exam.id, supabase).catch((error: unknown) =>
            serverError('exam status: load exam room failed', error, { examId: exam.id }),
        );
        if (room instanceof Response) return room;
        if (!room) return serverError('exam status: exam room not found', null, { examId: exam.id });
        const issues = findPublishIssues(exam.skill, room.parts);
        if (issues.length > 0) return fail('incomplete', 422, { issues });
    }

    const { data, error } = await supabase
        .from('exams')
        .update({ status, review_note: needsNote(status) ? note : null })
        .eq('id', exam.id)
        .select('id');
    if (error) return serverError('exam status: update failed', error, { examId: exam.id, status });
    if (data.length === 0) return fail('not_found', 404);
    expireExamSummaries();
    return NextResponse.json({ status });
}
