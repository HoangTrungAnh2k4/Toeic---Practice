import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { connection } from 'next/server';
import type { Database } from './database.types';

/**
 * Client Supabase mang phiên của người dùng (đọc từ cookie) cho Server Component. Đọc cookie là dữ liệu theo
 * request nên chỗ gọi phải nằm trong `<Suspense>` (cacheComponents).
 */
export async function createServerSupabase() {
    // supabase-js gọi Date.now() khi đọc phiên, không chạy được lúc prerender/prefetch dù đã có cookie
    await connection();
    const cookieStore = await cookies();
    return createServerClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            // Như lib/supabase.ts: không tự retry để trang lỗi hiện ngay thay vì chờ ~15s
            db: { retry: false },
            cookies: {
                getAll: () => cookieStore.getAll(),
                setAll: (list) => {
                    try {
                        list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
                    } catch {
                        // Server Component không ghi được cookie; proxy.ts đã làm mới phiên trước khi render
                    }
                },
            },
        },
    );
}
