import type { CookieOptions } from '@supabase/ssr';

/** Cookie (không phải localStorage) để proxy và server cũng biết người dùng có chọn ghi nhớ hay không. */
export const REMEMBER_COOKIE = 'toeco-remember';

/** Bỏ hạn của cookie phiên khi không ghi nhớ; cookie đang bị xoá (value rỗng) giữ nguyên `maxAge: 0`. */
export function sessionCookieOptions(remember: boolean, value: string, options: CookieOptions): CookieOptions {
    if (remember || !value) return options;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { maxAge, expires, ...rest } = options;
    return rest;
}
