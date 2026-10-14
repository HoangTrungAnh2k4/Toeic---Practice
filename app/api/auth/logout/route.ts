import { NextResponse } from 'next/server';
import { ACCESS_TOKEN_COOKIE, accessTokenCookieOptions } from '../../_lib/backend';

/** Đăng xuất: xoá cookie access token. */
export function POST() {
    const response = NextResponse.json({ code: 200, message: 'Logout successfully', data: null });
    response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...accessTokenCookieOptions, maxAge: 0 });
    return response;
}
