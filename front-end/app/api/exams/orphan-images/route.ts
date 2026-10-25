import { NextResponse } from 'next/server';
import { findOrphanExamImages } from '@/lib/exam-images';
import { serverError } from '@/lib/logger';
import { createAdminSupabase } from '@/lib/supabase-admin';
import { createServerSupabase, isAdmin } from '@/lib/supabase-server';

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/**
 * Liệt kê ảnh đề mồ côi trên R2 để admin xoá tay; chỉ đọc, không xoá gì. Kiểm vai trò bằng phiên,
 * rồi đọc câu hỏi bằng service_role để thấy cả đề nháp của admin khác (thiếu là báo nhầm ảnh đang dùng).
 */
export async function GET() {
    const supabase = await createServerSupabase();
    const { data: auth } = await supabase.auth.getClaims();
    if (!auth?.claims.sub) return fail('unauthorized', 401);
    if (!(await isAdmin(supabase, auth.claims.sub))) return fail('forbidden', 403);

    const orphans = await findOrphanExamImages(createAdminSupabase()).catch((error: unknown) =>
        serverError('orphan exam images: scan failed', error),
    );
    if (orphans instanceof Response) return orphans;
    return NextResponse.json({ count: orphans.length, orphans });
}
