import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { fromExamFormData } from '@/app/setting/exam-management/_lib/examFormData';
import { examSchema } from '@/app/setting/exam-management/_lib/examSchema';
import { deleteR2Object, putR2Object } from '@/lib/r2';
import { createServerSupabase } from '@/lib/supabase-server';

const EXTENSION: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

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

    const form = await request.formData().catch(() => null);
    const exam = examSchema.safeParse(form && fromExamFormData(form));
    if (!exam.success) return fail('invalid_body', 400);

    const publicBase = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    if (!publicBase) return fail('server_error', 500);

    const uploads: { key: string; file: File }[] = [];
    const payload = {
        ...exam.data,
        parts: exam.data.parts.map((part) => ({
            ...part,
            questions: part.questions.map(({ image, keywords, ...rest }) => {
                // `forms` rỗng: chỉ lưu từ gốc, AI tự đánh giá dạng từ khi chấm
                const question = { ...rest, keywords: keywords.length ? keywords.map((word) => ({ word, forms: [] })) : null };
                if (!image) return { ...question, image_path: null };
                const key = `exam-images/${randomUUID()}.${EXTENSION[image.type]}`;
                uploads.push({ key, file: image });
                return { ...question, image_path: `${publicBase}/${key}` };
            }),
        })),
    };

    const { data: examId, error } = await supabase.rpc('create_exam', { payload });
    if (error) {
        const [code, status] = RPC_ERROR[error.code] ?? ['server_error', 500];
        return fail(code, status);
    }

    const results = await Promise.allSettled(uploads.map(({ key, file }) => putR2Object(key, file)));
    if (results.every((result) => result.status === 'fulfilled')) return NextResponse.json({ id: examId });

    // Hoàn tác: xoá cả key chưa lên (R2 trả 204), rồi xoá đề; part/câu hỏi xoá theo cascade
    const cleanup = await Promise.allSettled(uploads.map(({ key }) => deleteR2Object(key)));
    const { error: deleteError } = await supabase.from('exams').delete().eq('id', examId);
    console.error('create exam: image upload failed, rolled back', {
        examId,
        upload: results.flatMap((result) => (result.status === 'rejected' ? [String(result.reason)] : [])),
        cleanup: cleanup.flatMap((result) => (result.status === 'rejected' ? [String(result.reason)] : [])),
        deleteExam: deleteError?.message ?? null,
    });
    return fail('upload_failed', 502);
}
