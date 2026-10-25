import { NextResponse } from 'next/server';
import { fromExamFormData } from '@/app/setting/exam-management/_lib/examFormData';
import { examSchema, toKeywordRows } from '@/app/setting/exam-management/_lib/examSchema';
import { newExamImage, r2PublicBase } from '@/lib/exam-images';
import { logger, serverError } from '@/lib/logger';
import { deleteR2Object, putR2Object } from '@/lib/r2';
import { createServerSupabase, isAdmin } from '@/lib/supabase-server';

/** Lỗi Postgres từ `create_exam` → mã lỗi + HTTP status cho client. */
const RPC_ERROR: Record<string, [string, number]> = {
    '42501': ['forbidden', 403],
    '22023': ['invalid_structure', 400],
};

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Tạo đề Speaking/Writing kèm ảnh (Speaking Part 2, Writing Q1–5): ghi DB trước (`create_exam`), rồi tải ảnh lên R2. Ảnh lỗi thì xoá đề và các ảnh
 * đã lên, nên đề chỉ tồn tại khi đủ ảnh và R2 không giữ ảnh của đề không tồn tại.
 */
export async function POST(request: Request) {
    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims.sub) return fail('unauthorized', 401);
    // Kiểm vai trò trước khi đọc body hay gọi R2, không chỉ dựa vào RLS của `create_exam`
    if (!(await isAdmin(supabase, auth.claims.sub))) return fail('forbidden', 403);

    const form = await request.formData().catch(() => null);
    const exam = examSchema.safeParse(form && fromExamFormData(form));
    if (!exam.success) return fail('invalid_body', 400);

    const publicBase = r2PublicBase();
    if (!publicBase) return serverError('create exam: R2_PUBLIC_URL is not set', null);

    const uploads: { key: string; file: File }[] = [];
    const payload = {
        ...exam.data,
        parts: exam.data.parts.map((part) => ({
            ...part,
            questions: part.questions.map(({ image, keywords, ...rest }) => {
                const question = { ...rest, keywords: toKeywordRows(keywords) };
                if (!image) return { ...question, image_path: null };
                const { key, path } = newExamImage(publicBase, image);
                uploads.push({ key, file: image });
                return { ...question, image_path: path };
            }),
        })),
    };

    const { data: examId, error } = await supabase.rpc('create_exam', { payload });
    if (error) {
        if (!RPC_ERROR[error.code]) logger.error('create exam: rpc failed', { error });
        const [code, status] = RPC_ERROR[error.code] ?? ['server_error', 500];
        return fail(code, status);
    }

    const results = await Promise.allSettled(uploads.map(({ key, file }) => putR2Object(key, file)));
    if (results.every((result) => result.status === 'fulfilled')) return NextResponse.json({ id: examId });

    // Hoàn tác: xoá cả key chưa lên (R2 trả 204), rồi xoá đề; part/câu hỏi xoá theo cascade
    const cleanup = await Promise.allSettled(uploads.map(({ key }) => deleteR2Object(key)));
    const { error: deleteError } = await supabase.from('exams').delete().eq('id', examId);
    logger.error('create exam: image upload failed, rolled back', {
        examId,
        upload: results.flatMap((result) => (result.status === 'rejected' ? [String(result.reason)] : [])),
        cleanup: cleanup.flatMap((result) => (result.status === 'rejected' ? [String(result.reason)] : [])),
        deleteExam: deleteError?.message ?? null,
    });
    return fail('upload_failed', 502);
}
