import { NextResponse, type NextRequest } from 'next/server';
import {
    ACCESS_TOKEN_COOKIE,
    accessTokenCookieOptions,
    BACKEND_TIMEOUT_MS,
    BACKEND_URL,
    BAD_GATEWAY,
    forwardHeaders,
} from '../_lib/backend';

/** Chuyển tiếp mọi request /api/* sang backend, gắn access token từ cookie HttpOnly vào header Bearer. */
async function proxy(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    const { path } = await ctx.params;
    const url = `${BACKEND_URL}/${path.map(encodeURIComponent).join('/')}${request.nextUrl.search}`;

    const headers = forwardHeaders(request);
    const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';

    let backendRes: Response;
    try {
        backendRes = await fetch(url, {
            method: request.method,
            headers,
            body: hasBody ? await request.arrayBuffer() : undefined,
            cache: 'no-store',
            signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
        });
    } catch {
        return BAD_GATEWAY();
    }

    const response = new NextResponse(backendRes.body, {
        status: backendRes.status,
        headers: { 'Content-Type': backendRes.headers.get('content-type') ?? 'application/json' },
    });
    // Token hết hạn / không hợp lệ → xoá cookie
    if (backendRes.status === 401 && token) {
        response.cookies.set(ACCESS_TOKEN_COOKIE, '', { ...accessTokenCookieOptions, maxAge: 0 });
    }
    return response;
}

export { proxy as GET, proxy as POST, proxy as PUT, proxy as PATCH, proxy as DELETE };
