import axiosClient from './axiosClient';
import type { ApiResponse, User } from './types';

export interface LoginPayload {
    email: string;
    password: string;
    remember: boolean;
}

export interface LoginData {
    /** Thời hạn access token (giây); token nằm trong cookie HttpOnly do BFF set. */
    expiresIn: number;
    user: User;
}

export const authApi = {
    async login(payload: LoginPayload) {
        const { data } = await axiosClient.post<ApiResponse<LoginData>>('/auth/login', payload);
        return data.data;
    },

    async logout() {
        await axiosClient.post<ApiResponse<null>>('/auth/logout');
    },

    async me() {
        const { data } = await axiosClient.get<ApiResponse<User>>('/auth/me');
        return data.data;
    },
};
