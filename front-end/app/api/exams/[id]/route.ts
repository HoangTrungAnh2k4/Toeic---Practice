import { NextResponse } from 'next/server';
import { z } from 'zod';
import { fromExamFormData } from '@/app/exam-management/_lib/examFormData';
import { examInfoSchema, examSchema, toKeywordRows } from '@/app/exam-management/_lib/examSchema';
import { getExam, listQuestions } from '@/lib/data/content';
import { deleteUnusedExamImages, newExamImage, r2PublicBase } from '@/lib/exam-images';
import { expireExamSummaries } from '@/lib/exam-library/summaries';
import { logger, serverError } from '@/lib/logger';
import { deleteR2Object, putR2Object } from '@/lib/r2';
import { createServerSupabase, isAdmin } from '@/lib/supabase-server';

type Params = { params: Promise<{ id: string }> };

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Lỗi Postgres từ `update_exam` → mã lỗi + HTTP status cho client. */
const RPC_ERROR: Record<string, [string, number]> = {
    '42501': ['forbidden', 403],
    P0002: ['not_found', 404],
    '22023': ['invalid_structure', 400],
    '55006': ['has_attempts', 409],
};

/** Phiên admin + id đề hợp lệ; `Response` khi phải dừng sớm. */
async function open(params: Params['params']) {
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) return fail('not_found', 404);
    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims.sub) return fail('unauthorized', 401);
    if (!(await isAdmin(supabase, auth.claims.sub))) return fail('forbidden', 403);
    return { id: id.data, supabase };
}

/**
 * Sửa đề. `scope=info`: chỉ thông tin chung (đề đã có lượt làm). Còn lại: cả nội dung, ảnh mới
 * tải lên R2 trước rồi mới gọi `update_exam`; RPC lỗi thì xoá ảnh vừa tải, thành công thì dọn ảnh cũ đã bị thay.
 */
export async function PUT(request: Request, { params }: Params) {
    const opened = await open(params);
    if (opened instanceof Response) return opened;
    const { id, supabase } = opened;

    const form = await request.formData().catch(() => null);
    const raw = form && fromExamFormData(form);
    const exam = await getExam(id, supabase).catch((error: unknown) =>
        serverError('update exam: load exam failed', error, { examId: id }),
    );
    if (exam instanceof Response) return exam;
    if (!exam) return fail('not_found', 404);

    if (form?.get('scope') === 'info') {
        const info = examInfoSchema.safeParse(raw);
        if (!info.success) return fail('invalid_body', 400);
        const { error } = await supabase.rpc('update_exam', { target_exam_id: id, payload: info.data });
        if (!error) {
            expireExamSummaries();
            return NextResponse.json({ id });
        }
        if (!RPC_ERROR[error.code]) logger.error('update exam info: rpc failed', { error, examId: id });
        const [code, status] = RPC_ERROR[error.code] ?? ['server_error', 500];
        return fail(code, status);
    }

    const parsed = examSchema.safeParse(raw);
    if (!parsed.success || parsed.data.skill !== exam.skill) return fail('invalid_body', 400);
    const base = r2PublicBase();
    if (!base) return serverError('update exam: R2_PUBLIC_URL is not set', null);
    const current = await listQuestions(id, supabase).catch((error: unknown) =>
        serverError('update exam: load questions failed', error, { examId: id }),
    );
    if (current instanceof Response) return current;
    const currentPath = new Map(current.map((question) => [question.number, question.image_path]));

    const uploads: { key: string; file: File }[] = [];
    let foreignImage = false;
    const payload = {
        ...parsed.data,
        parts: parsed.data.parts.map((part) => ({
            ...part,
            questions: part.questions.map(({ image, keywords, ...rest }) => {
                const question = { ...rest, keywords: toKeywordRows(keywords) };
                if (image) {
                    const { key, path } = newExamImage(base, image);
                    uploads.push({ key, file: image });
                    return { ...question, image_path: path };
                }
                // Client chỉ được giữ ảnh hiện tại của chính câu đó, không trỏ sang ảnh tuỳ ý
                if (question.image_path && question.image_path !== currentPath.get(question.number))
                    foreignImage = true;
                return question;
            }),
        })),
    };
    if (foreignImage) return fail('invalid_body', 400);

    const removeUploads = () => Promise.allSettled(uploads.map(({ key }) => deleteR2Object(key)));
    const results = await Promise.allSettled(uploads.map(({ key, file }) => putR2Object(key, file)));
    if (results.some((result) => result.status === 'rejected')) {
        logger.error('update exam: image upload failed', {
            examId: id,
            upload: results.flatMap((result) => (result.status === 'rejected' ? [String(result.reason)] : [])),
        });
        await removeUploads();
        return fail('upload_failed', 502);
    }

    const { error } = await supabase.rpc('update_exam', { target_exam_id: id, payload });
    if (error) {
        await removeUploads();
        if (!RPC_ERROR[error.code]) logger.error('update exam: rpc failed', { error, examId: id });
        const [code, status] = RPC_ERROR[error.code] ?? ['server_error', 500];
        return fail(code, status);
    }
    expireExamSummaries();

    const kept = new Set(payload.parts.flatMap((part) => part.questions.map((question) => question.image_path)));
    await deleteUnusedExamImages(
        supabase,
        current.map((question) => question.image_path).filter((path) => !kept.has(path)),
        id,
    );
    return NextResponse.json({ id });
}

/**
 * Xoá đề bằng phiên admin (RLS chặn người khác), rồi xoá ảnh của đề trên R2. Xoá DB trước: lỗi R2 chỉ để sót ảnh
 * (ghi log), không để đề trỏ tới ảnh đã mất. Part, câu hỏi, bookmark xoá theo cascade.
 */
export async function DELETE(_request: Request, { params }: Params) {
    const opened = await open(params);
    if (opened instanceof Response) return opened;
    const { id, supabase } = opened;

    const questions = await listQuestions(id, supabase).catch((error: unknown) =>
        serverError('delete exam: load questions failed', error, { examId: id }),
    );
    if (questions instanceof Response) return questions;

    const { data: deleted, error } = await supabase.from('exams').delete().eq('id', id).select('id');
    // 23503: `attempts.exam_id` là `on delete restrict` để giữ lịch sử làm bài
    if (error?.code === '23503') return fail('has_attempts', 409);
    if (error) return serverError('delete exam failed', error, { examId: id });
    // RLS chặn thì Supabase không báo lỗi, chỉ xoá 0 dòng
    if (deleted.length === 0) return fail('not_found', 404);
    expireExamSummaries();

    await deleteUnusedExamImages(
        supabase,
        questions.map((question) => question.image_path),
        id,
    );
    return new NextResponse(null, { status: 204 });
}
