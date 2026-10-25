import { NextResponse } from 'next/server';
import { z } from 'zod';
import { logger } from '@/lib/logger';
import { createServerSupabase, isAdmin } from '@/lib/supabase-server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** Lỗi Postgres từ `duplicate_exam` → mã lỗi + HTTP status cho client. */
const RPC_ERROR: Record<string, [string, number]> = {
    '42501': ['forbidden', 403],
    P0002: ['not_found', 404],
};

/**
 * Nhân bản đề thành bản nháp mới của admin (cả Part, câu hỏi, ảnh dùng chung URL) để sửa nội dung đề đã bị khoá
 * vì có lượt làm. Bản nháp chưa lên Thư viện nên không cần làm mới cache kho đề.
 */
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const id = z.uuid().safeParse((await params).id);
    if (!id.success) return fail('not_found', 404);

    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims.sub) return fail('unauthorized', 401);
    if (!(await isAdmin(supabase, auth.claims.sub))) return fail('forbidden', 403);

    const { data, error } = await supabase.rpc('duplicate_exam', { source_exam_id: id.data });
    if (error) {
        if (!RPC_ERROR[error.code]) logger.error('duplicate exam: rpc failed', { error, examId: id.data });
        const [code, status] = RPC_ERROR[error.code] ?? ['server_error', 500];
        return fail(code, status);
    }
    return NextResponse.json({ id: data }, { status: 201 });
}
