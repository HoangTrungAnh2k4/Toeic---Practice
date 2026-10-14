'use client';

import { useEffect } from 'react';
import type { CurrentUser } from '@/app/setting/profile/types';
import { useAuthStore } from '@/stores/auth.store';

function toInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    const picked = words.length > 1 ? [words[0], words[words.length - 1]] : words;
    return picked.map((word) => word[0]?.toUpperCase() ?? '').join('');
}

/** User đang đăng nhập lấy từ auth store (`null` = khách). */
export function useCurrentUser(): CurrentUser | null {
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        void useAuthStore.persist.rehydrate();
    }, []);

    if (!user) return null;
    // Backend chưa trả role / ngày tham gia
    return { name: user.name, email: user.email, initials: toInitials(user.name), role: 'Học viên', joinedAt: '' };
}
