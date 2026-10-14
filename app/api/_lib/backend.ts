import { NextResponse, type NextRequest } from 'next/server';

/** URL backend Go, chỉ dùng phía server (không lộ ra trình duyệt). */
export const BACKEND_URL = process.env.BACKEND_API_URL ?? 'http://localhost:8080/api/v1';

/** Timeout cho mỗi request tới backend. */
export const BACKEND_TIMEOUT_MS = 15_000;

export const ACCESS_TOKEN_COOKIE = 'access_token';

export const accessTokenCookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
} as const;

/** Header chung gửi sang backend. */
export function forwardHeaders(request: NextRequest): Headers {
    const headers = new Headers({ Accept: 'application/json' });
    const contentType = request.headers.get('content-type');
    if (contentType) headers.set('Content-Type', contentType);
    return headers;
}

/** Trả lỗi theo envelope chung của backend. */
export function errorResponse(status: number, error: string, message: string) {
    return NextResponse.json({ code: status, error, message, data: null }, { status });
}

export const BAD_GATEWAY = () => errorResponse(502, 'BAD_GATEWAY', 'backend unavailable');
