import { authApi } from '@/apis/auth.api';
import { getApiErrorCode } from '@/apis/axiosClient';
import { useAuthStore } from '@/stores/auth.store';
import type { LoginValues, RegisterValues } from './schemas';

export type AuthResult = { ok: true } | { ok: false; message: string };

/** Trang chuyển tới sau khi đăng nhập / đăng ký thành công. */
export const AFTER_AUTH_HREF = '/overview';

const NETWORK_ERROR = 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';

const LOGIN_ERRORS: Record<string, string> = {
    INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng.',
    VALIDATION_FAILED: 'Thông tin đăng nhập chưa hợp lệ.',
};

/** Đăng nhập bằng email/mật khẩu: backend set cookie HttpOnly, user được lưu vào store. */
export async function signInWithEmail(values: LoginValues): Promise<AuthResult> {
    try {
        const { user } = await authApi.login(values);
        useAuthStore.getState().setUser(user);
        return { ok: true };
    } catch (error) {
        const code = getApiErrorCode(error);
        if (code === null) return { ok: false, message: NETWORK_ERROR };
        return { ok: false, message: LOGIN_ERRORS[code] ?? 'Đăng nhập thất bại. Vui lòng thử lại.' };
    }
}

/**
 * CHƯA nối backend: đăng ký và Google chỉ giả lập độ trễ rồi trả thành công để duyệt luồng giao diện.
 */
const MOCK_LATENCY_MS = 800;

function mockRequest(): Promise<AuthResult> {
    return new Promise((resolve) => setTimeout(() => resolve({ ok: true }), MOCK_LATENCY_MS));
}

export const signUpWithEmail: (values: RegisterValues) => Promise<AuthResult> = mockRequest;
export const continueWithGoogle: () => Promise<AuthResult> = mockRequest;
