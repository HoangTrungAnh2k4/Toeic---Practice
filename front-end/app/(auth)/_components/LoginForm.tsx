'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuLockKeyhole, LuMail } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { loginSchema } from '../_lib/schemas';
import { supabase, setRememberSession } from '@/lib/supabase';
import { authErrorMessage } from '../_lib/authError';
import AuthCheckboxField from './AuthCheckboxField';
import AuthFormError from './AuthFormError';
import AuthTextField from './AuthTextField';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginForm() {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: true },
    });
    const remember = useWatch({ control: form.control, name: 'remember' });

    const onSubmit = form.handleSubmit(async ({ email, password, remember }) => {
        setRememberSession(remember);
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (!error) return router.replace('/overview');

        // Đăng ký rồi nhưng chưa nhập mã: gửi lại mã và chuyển sang bước xác thực
        if (error.code === 'email_not_confirmed') {
            const { error: resendError } = await supabase.auth.resend({ type: 'signup', email });
            if (resendError) return form.setError('root', { message: authErrorMessage(resendError) });
            return router.push(`/verify-email?email=${encodeURIComponent(email)}`);
        }
        form.setError('root', { message: authErrorMessage(error) });
    });

    return (
        <div className="flex flex-col gap-6">
            <GoogleAuthButton label="Tiếp tục với Google" remember={remember} />

            <FieldSeparator>hoặc đăng nhập bằng email</FieldSeparator>

            {/* method="post": bấm trước khi hydrate thì trình duyệt submit gốc, không để mật khẩu/mã lên URL */}
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
                    <Controller
                        name="password"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <AuthTextField
                                {...field}
                                label="Mật khẩu"
                                type="password"
                                icon={LuLockKeyhole}
                                autoComplete="current-password"
                                placeholder="Nhập mật khẩu"
                                error={fieldState.error?.message}
                            />
                        )}
                    />
                    <Controller
                        name="remember"
                        control={form.control}
                        render={({ field }) => (
                            <AuthCheckboxField
                                ref={field.ref}
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                label="Ghi nhớ đăng nhập"
                            />
                        )}
                    />

                    <AuthFormError message={form.formState.errors.root?.message} />
                    <Button
                        type="submit"
                        variant="primary"
                        className="gap-2 mt-2"
                        size={'lg'}
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
