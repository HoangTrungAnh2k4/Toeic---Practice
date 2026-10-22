import type { CookieOptions } from '@supabase/ssr';

/** Cookie (không phải localStorage) để proxy và server cũng biết người dùng có chọn ghi nhớ hay không. */
export const REMEMBER_COOKIE = 'toeco-remember';

/** "Ghi nhớ đăng nhập": cookie phiên sống 30 ngày (mặc định của @supabase/ssr là 400 ngày). */
const REMEMBER_MAX_AGE = 30 * 24 * 60 * 60;

/**
 * Ghi nhớ thì cookie phiên hết hạn sau 30 ngày, không ghi nhớ thì bỏ hạn (đóng trình duyệt là mất).
 * Cookie đang bị xoá (value rỗng) giữ nguyên `maxAge: 0`.
 */
export function sessionCookieOptions(remember: boolean, value: string, options: CookieOptions): CookieOptions {
    if (!value) return options;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { maxAge, expires, ...rest } = options;
    return remember ? { ...rest, maxAge: REMEMBER_MAX_AGE } : rest;
}
