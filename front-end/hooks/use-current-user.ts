'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { CurrentUser } from '@/app/setting/profile/types';
import { supabase } from '@/lib/supabase';

function toCurrentUser(user: User, isAdmin: boolean): CurrentUser {
    const email = user.email ?? '';
    const name = (user.user_metadata.full_name as string | undefined)?.trim() || email.split('@')[0];
    const initials = name
        .split(/\s+/)
        .slice(-2)
        .map((word) => word[0]?.toUpperCase())
        .join('');

    return {
        name,
        initials,
        email,
        avatarUrl: user.user_metadata.avatar_url as string | undefined,
        role: isAdmin ? 'Quản trị viên' : 'Học viên',
        isAdmin,
        joinedAt: new Date(user.created_at).toLocaleDateString('vi-VN'),
    };
}

/** `undefined` = chưa đọc xong phiên (cả lúc render phía server), `null` = khách. */
export function useCurrentUser(): CurrentUser | null | undefined {
    const [user, setUser] = useState<CurrentUser | null>();

    useEffect(() => {
        // Bỏ kết quả role của phiên cũ khi auth đổi liên tiếp hoặc đã unmount
        let seq = 0;
        // onAuthStateChange phát INITIAL_SESSION ngay khi đăng ký nên không cần getSession riêng
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            const current = ++seq;
            if (!session) return setUser(null);
            // Gọi supabase ngay trong callback dễ kẹt khoá auth (theo docs supabase-js) nên dời ra sau
            setTimeout(async () => {
                // Role chỉ để chọn giao diện; quyền thật do layout quản trị + RLS kiểm. Lỗi thì coi như học viên.
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .maybeSingle();
                if (current === seq) setUser(toCurrentUser(session.user, profile?.role === 'admin'));
            });
        });
        return () => {
            seq++;
            data.subscription.unsubscribe();
        };
    }, []);

    return user;
}
