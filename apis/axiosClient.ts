import axios, { isAxiosError } from 'axios';
import type { ApiResponse } from './types';

/**
 * Instance dùng chung: gọi BFF cùng origin (`app/api`), trình duyệt tự gửi cookie HttpOnly.
 * BFF đọc cookie, gắn Bearer token rồi chuyển tiếp sang backend.
 */
const axiosClient = axios.create({
    baseURL: '/api',
    withCredentials: true,
    timeout: 15_000,
    headers: { 'Content-Type': 'application/json' },
});

type UnauthorizedListener = () => void;
let onUnauthorized: UnauthorizedListener | null = null;

/** Đăng ký hành động khi phiên hết hạn (401), vd. xoá user trong store. */
export function setUnauthorizedListener(listener: UnauthorizedListener | null) {
    onUnauthorized = listener;
}

axiosClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
        if (!isAxiosError<ApiResponse<unknown>>(error)) return Promise.reject(error);

        const { config, response } = error;
        // Không log body request để tránh lộ mật khẩu
        console.error('[API error]', {
            method: config?.method?.toUpperCase(),
            url: config?.url,
            status: response?.status ?? 'NETWORK_ERROR',
            code: response?.data?.error ?? error.code,
            message: response?.data?.message ?? error.message,
        });

        if (response?.status === 401) onUnauthorized?.();
        return Promise.reject(error);
    },
);

/** Lấy mã lỗi backend (field `error` của envelope); `null` nếu lỗi mạng / không có phản hồi. */
export function getApiErrorCode(error: unknown): string | null {
    if (!isAxiosError<ApiResponse<unknown>>(error)) return null;
    return error.response?.data?.error ?? null;
}

export default axiosClient;
