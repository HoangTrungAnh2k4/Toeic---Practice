import type { LoginValues, RegisterValues } from './schemas';

export type AuthResult = { ok: true } | { ok: false; message: string };

/** Trang chuyển tới sau khi đăng nhập / đăng ký thành công. */
export const AFTER_AUTH_HREF = '/overview';

/**
 * CHƯA nối backend xác thực: các hàm dưới chỉ giả lập độ trễ rồi trả thành công để duyệt luồng giao diện.
 * Khi tích hợp (API riêng, Auth.js, Supabase...), thay phần thân và giữ nguyên chữ ký.
 */
const MOCK_LATENCY_MS = 800;

function mockRequest(): Promise<AuthResult> {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), MOCK_LATENCY_MS));
}

export const signInWithEmail: (values: LoginValues) => Promise<AuthResult> = mockRequest;
export const signUpWithEmail: (values: RegisterValues) => Promise<AuthResult> = mockRequest;
export const continueWithGoogle: () => Promise<AuthResult> = mockRequest;
