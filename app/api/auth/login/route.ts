import { NextResponse, type NextRequest } from 'next/server';
import {
    ACCESS_TOKEN_COOKIE,
    accessTokenCookieOptions,
    BACKEND_TIMEOUT_MS,
    BACKEND_URL,
    BAD_GATEWAY,
    errorResponse,
    forwardHeaders,
} from '../../_lib/backend';

interface BackendLoginData {
    accessToken: string;
    expiresIn: number;
    user: { id: number; name: string; email: string };
}

/** Đăng nhập qua backend, lưu access token vào cookie HttpOnly và chỉ trả user cho trình duyệt. */
export async function POST(request: NextRequest) {
    let body: { email?: unknown; password?: unknown; remember?: unknown };
    try {
        body = await request.json();
    } catch {
        return errorResponse(400, 'INVALID_REQUEST_BODY', 'invalid request body');
    }

    let backendRes: Response;
    try {
        backendRes = await fetch(`${BACKEND_URL}/auth/login`, {
            method: 'POST',
            headers: forwardHeaders(request),
            body: JSON.stringify({ email: body.email, password: body.password }),
            cache: 'no-store',
            signal: AbortSignal.timeout(BACKEND_TIMEOUT_MS),
        });
    } catch {
        return BAD_GATEWAY();
    }

    const payload = await backendRes.json().catch(() => null);
    if (!payload) return BAD_GATEWAY();
    if (!backendRes.ok) return NextResponse.json(payload, { status: backendRes.status });

    const { accessToken, expiresIn, user } = payload.data as BackendLoginData;
    const response = NextResponse.json({ ...payload, data: { user, expiresIn } });
    response.cookies.set(ACCESS_TOKEN_COOKIE, accessToken, {
        ...accessTokenCookieOptions,
        // Không "Ghi nhớ đăng nhập" → cookie phiên, mất khi đóng trình duyệt
        maxAge: body.remember === true ? expiresIn : undefined,
    });
    return response;
}
