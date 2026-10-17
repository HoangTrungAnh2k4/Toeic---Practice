import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Client service_role, chỉ dùng trong Route Handler để ghi cột điểm và đếm quota mà client không có quyền.
 * Bỏ qua RLS: chỗ gọi phải tự kiểm tra quyền (bằng client mang phiên) trước khi ghi.
 */
export function createAdminSupabase() {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
    return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
