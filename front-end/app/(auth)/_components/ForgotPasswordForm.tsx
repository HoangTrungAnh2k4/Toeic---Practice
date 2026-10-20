'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuMail } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { FieldGroup } from '@/components/ui/field';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '../_lib/authError';
import { forgotPasswordSchema } from '../_lib/schemas';
import AuthFormError from './AuthFormError';
import AuthTextField from './AuthTextField';

export default function ForgotPasswordForm() {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: { email: '' },
    });

    const onSubmit = form.handleSubmit(async ({ email }) => {
        // Supabase trả thành công cả khi email chưa đăng ký, nên không lộ email nào có tài khoản
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) return form.setError('root', { message: authErrorMessage(error) });
        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    });

    return (
        <form method="post" noValidate onSubmit={onSubmit}>
            <FieldGroup className="gap-4">
                <Controller
                    name="email"
                    control={form.control}
                    render={({ field, fieldState }) => (
                        <AuthTextField
                            {...field}
                            label="Email"
                            type="email"
                            icon={LuMail}
                            autoComplete="email"
                            placeholder="ban@email.com"
                            error={fieldState.error?.message}
                        />
                    )}
                />

                <AuthFormError message={form.formState.errors.root?.message} />
                <Button type="submit" variant="primary" size={'lg'} disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Đang gửi mã...' : 'Gửi mã đặt lại'}
                </Button>
            </FieldGroup>
        </form>
    );
}
