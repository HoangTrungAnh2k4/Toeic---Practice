import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { setUnauthorizedListener } from '@/apis/axiosClient';
import type { User } from '@/apis/types';

interface AuthState {
    /** Chỉ lưu thông tin hiển thị; access token nằm trong cookie HttpOnly, JS không đọc được. */
    user: User | null;
    setUser: (user: User | null) => void;
    clear: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clear: () => set({ user: null }),
        }),
        {
            name: 'toeco-auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user }),
            // Nạp từ localStorage sau khi mount (xem useCurrentUser) để tránh lệch hydration với SSR
            skipHydration: true,
        },
    ),
);

// Cookie hết hạn / không hợp lệ → xoá user đã lưu
setUnauthorizedListener(() => useAuthStore.getState().clear());
