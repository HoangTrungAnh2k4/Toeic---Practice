'use client';

import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import type { CurrentUser } from '@/app/setting/profile/types';
import { supabase } from '@/lib/supabase';

function toCurrentUser(user: User): CurrentUser {
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
        role: 'Học viên',
        joinedAt: new Date(user.created_at).toLocaleDateString('vi-VN'),
    };
}

export function useCurrentUser(): CurrentUser | null {
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        // onAuthStateChange phát INITIAL_SESSION ngay khi đăng ký nên không cần getSession riêng
        const { data } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session ? toCurrentUser(session.user) : null);
        });
        return () => data.subscription.unsubscribe();
    }, []);

    return user;
}
