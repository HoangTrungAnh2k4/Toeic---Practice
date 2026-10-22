'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuKeyRound } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '../_lib/authError';
import { otpSchema } from '../_lib/schemas';
import AuthFormError from './AuthFormError';
import AuthTextField from './AuthTextField';

export default function VerifyOtpForm() {
    const router = useRouter();
    const email = useSearchParams().get('email') ?? '';
    const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle');
    const form = useForm({
        resolver: zodResolver(otpSchema),
        defaultValues: { token: '' },
    });
    const token = useWatch({ control: form.control, name: 'token' });

    const onSubmit = form.handleSubmit(async ({ token }) => {
        const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
        if (error) return form.setError('root', { message: authErrorMessage(error) });
        router.replace('/overview');
    });

    const resend = async () => {
        setResendState('sending');
        form.clearErrors('root');
        const { error } = await supabase.auth.resend({ type: 'signup', email });
        if (error) form.setError('root', { message: authErrorMessage(error) });
        setResendState(error ? 'idle' : 'sent');
    };

    if (!email) {
        return (
            <p className="text-subText text-sm">
                Thiếu email cần xác thực.{' '}
                <Link href="/register" className="font-bold text-main hover:underline underline-offset-4">
                    Quay lại đăng ký
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
                            // Chỉ nhận chữ số: gõ/dán chữ cái thì bỏ đi
                            onChange={(event) => field.onChange(event.target.value.replace(/\D/g, ''))}
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

                <AuthFormError message={form.formState.errors.root?.message} />
                <Button
                    type="submit"
                    variant="primary"
                    size={'lg'}
                    disabled={form.formState.isSubmitting || token.length !== 6}
                >
                    {form.formState.isSubmitting ? 'Đang xác thực...' : 'Xác thực'}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size={'md'}
                    onClick={resend}
                    disabled={resendState === 'sending'}
                >
                    {resendState === 'sending' ? 'Đang gửi...' : 'Gửi lại mã'}
                </Button>
                <p aria-live="polite" className="text-subText text-sm text-center">
                    {resendState === 'sent' && 'Đã gửi lại mã, hãy kiểm tra hộp thư (kể cả thư rác).'}
                </p>
            </FieldGroup>
        </form>
    );
}
