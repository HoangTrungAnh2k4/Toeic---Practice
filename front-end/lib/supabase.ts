import { createBrowserClient, parse, serialize } from '@supabase/ssr';
import type { Database } from './database.types';
import { REMEMBER_COOKIE, sessionCookieOptions } from './supabase-cookies';

/** Gọi trước khi đăng nhập: không ghi nhớ thì cookie phiên không có hạn, đóng trình duyệt là mất. */
export function setRememberSession(remember: boolean) {
    document.cookie = serialize(REMEMBER_COOKIE, remember ? '' : '0', {
        path: '/',
        sameSite: 'lax',
        ...(remember && { maxAge: 0 }),
    });
}

/** Trên server không có `document` nên client này chỉ gọi Supabase như anon; cần phiên thì dùng `lib/supabase-server.ts`. */
export const supabase = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    typeof window === 'undefined'
        ? undefined
        : {
              cookies: {
                  getAll: () => Object.entries(parse(document.cookie)).map(([name, value = '']) => ({ name, value })),
                  setAll: (cookies) => {
                      const remember = parse(document.cookie)[REMEMBER_COOKIE] !== '0';
                      cookies.forEach(({ name, value, options }) => {
                          document.cookie = serialize(name, value, sessionCookieOptions(remember, value, options));
                      });
                  },
              },
          },
);
