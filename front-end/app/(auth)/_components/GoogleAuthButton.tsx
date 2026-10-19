'use client';

import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/ui/button';
import { supabase, setRememberSession } from '@/lib/supabase';
import { authErrorMessage } from '../_lib/authError';
import AuthFormError from './AuthFormError';

interface GoogleAuthButtonProps {
    label: string;
    remember?: boolean;
}

export default function GoogleAuthButton({ label, remember = true }: GoogleAuthButtonProps) {
    const [pending, setPending] = useState(false);
    const [error, setError] = useState<string>();

    const onClick = async () => {
        setPending(true);
        setError(undefined);
        setRememberSession(remember);
        // Thành công thì trình duyệt rời trang sang Google, supabase-js tự đọc session từ URL khi quay về
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/overview` },
        });
        if (error) {
            setError(authErrorMessage(error));
            setPending(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <Button
                type="button"
                variant="third"
                size={'lg'}
                className="hover:bg-white hover:text-black"
                onClick={onClick}
                disabled={pending}
            >
                <FcGoogle aria-hidden="true" className="mr-1 size-5" />
                {pending ? 'Đang chuyển  Google...' : label}
            </Button>
            <AuthFormError message={error} />
        </div>
    );
}
