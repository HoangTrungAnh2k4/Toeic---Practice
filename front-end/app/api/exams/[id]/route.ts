import { NextResponse } from 'next/server';
import { z } from 'zod';
import { deleteR2Object } from '@/lib/r2';
import { createServerSupabase } from '@/lib/supabase-server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Xoá đề bằng phiên admin (RLS chặn người khác), rồi xoá ảnh của đề trên R2. Xoá DB trước: lỗi R2 chỉ để sót ảnh
 * (ghi log), không để đề trỏ tới ảnh đã mất. Part, câu hỏi, bookmark xoá theo cascade.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) return fail('not_found', 404);

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims.sub) return fail('unauthorized', 401);

    const { data: questions, error: readError } = await supabase
        .from('questions')
        .select('image_path, exam_parts!inner(exam_id)')
        .eq('exam_parts.exam_id', id.data)
        .not('image_path', 'is', null);
    if (readError) return fail('server_error', 500);

    const { data: deleted, error } = await supabase.from('exams').delete().eq('id', id.data).select('id');
    // 23503: `attempts.exam_id` là `on delete restrict` để giữ lịch sử làm bài
    if (error?.code === '23503') return fail('has_attempts', 409);
    if (error) return fail('server_error', 500);
    // RLS chặn thì Supabase không báo lỗi, chỉ xoá 0 dòng
    if (deleted.length === 0) return fail('not_found', 404);

    // Chỉ ảnh do `POST /api/exams` tải lên; ảnh khác (vd. `/img/...` của seed) không nằm trên R2
    const base = process.env.R2_PUBLIC_URL?.replace(/\/$/, '');
    const paths = [
        ...new Set(questions.flatMap(({ image_path }) => (base && image_path?.startsWith(`${base}/exam-images/`) ? [image_path] : []))),
    ];
    if (!base || paths.length === 0) return new NextResponse(null, { status: 204 });

    // Không xoá ảnh đề khác còn dùng (vd. đề nhập tay trỏ chung URL)
    const { data: shared, error: sharedError } = await supabase.from('questions').select('image_path').in('image_path', paths);
    if (sharedError) {
        console.error('delete exam: R2 images left behind', { examId: id.data, paths });
        return new NextResponse(null, { status: 204 });
    }
    const keys = paths
        .filter((path) => !shared.some((row) => row.image_path === path))
        .map((path) => path.slice(base.length + 1));
    const results = await Promise.allSettled(keys.map((key) => deleteR2Object(key)));
    const failed = keys.filter((_, index) => results[index].status === 'rejected');
    if (failed.length > 0) console.error('delete exam: R2 images left behind', { examId: id.data, keys: failed });
    return new NextResponse(null, { status: 204 });
}
