'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuKeyRound, LuLockKeyhole } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '../_lib/authError';
import { resetPasswordSchema } from '../_lib/schemas';
import AuthFormError from './AuthFormError';
import AuthTextField from './AuthTextField';

export default function ResetPasswordForm() {
    const router = useRouter();
    const email = useSearchParams().get('email') ?? '';
    // Mã chỉ dùng được một lần: đổi mật khẩu lỗi thì lần sau dùng luôn phiên recovery đã có
    const [verified, setVerified] = useState(false);
    const form = useForm({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: { token: '', password: '' },
    });

    const onSubmit = form.handleSubmit(async ({ token, password }) => {
        if (!verified) {
            const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
            if (error) return form.setError('root', { message: authErrorMessage(error) });
            setVerified(true);
        }
        const { error } = await supabase.auth.updateUser({ password });
        if (error) return form.setError('root', { message: authErrorMessage(error) });
        router.replace('/overview');
    });

    if (!email) {
        return (
            <p className="text-subText text-sm">
                Thiếu email cần đặt lại mật khẩu.{' '}
                <Link href="/forgot-password" className="font-bold text-main hover:underline underline-offset-4">
                    Nhập lại email
                </Link>
            </p>
        );
    }

    // method="post": bấm trước khi hydrate thì trình duyệt submit gốc, không để mật khẩu/mã lên URL
    return (
        <form method="post" noValidate onSubmit={onSubmit}>
            <FieldGroup className="gap-4">
                <p className="text-subText text-sm">
                    Đã gửi tới <strong className="font-semibold text-main break-all">{email}</strong>
                </p>
                <Controller
                    name="token"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <AuthTextField
                            {...field}
                            label="Mã xác thực"
                            icon={LuKeyRound}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                            maxLength={6}
                            placeholder="123456"
                            error={fieldState.error?.message}
                        />
                    )}
                />
                <Controller
                    name="password"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <AuthTextField
                            {...field}
                            label="Mật khẩu mới"
                            type="password"
                            icon={LuLockKeyhole}
                            autoComplete="new-password"
                            placeholder="Tối thiểu 8 ký tự"
                            description="Tối thiểu 8 ký tự, gồm cả chữ và số"
                            error={fieldState.error?.message}
                        />
                    )}
                />

                <AuthFormError message={form.formState.errors.root?.message} />
                <Button type="submit" variant="primary" size={'lg'} disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Đang cập nhật...' : 'Đặt lại mật khẩu'}
                </Button>
            </FieldGroup>
        </form>
    );
}
