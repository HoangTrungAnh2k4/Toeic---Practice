'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCircleAlert, LuLoaderCircle, LuLockKeyhole, LuMail, LuUserRound } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { continueWithGoogle, signUpWithEmail } from '../_lib/auth';
import { registerSchema } from '../_lib/schemas';
import { useAuthAction } from '../_lib/useAuthAction';
import AuthCheckboxField from './AuthCheckboxField';
import AuthTextField from './AuthTextField';
import GoogleAuthButton from './GoogleAuthButton';

export default function RegisterForm() {
    const { run, error, isPending, pendingMethod } = useAuthAction();
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', password: '', confirmPassword: '', acceptTerms: false },
    });

    const onSubmit = form.handleSubmit((values) => run('email', () => signUpWithEmail(values)));

    return (
        <div className="flex flex-col gap-6">
            <GoogleAuthButton
                label="Đăng ký bằng Google"
                pending={pendingMethod === 'google'}
                disabled={isPending}
                onClick={() => run('google', continueWithGoogle)}
            />

            <FieldSeparator>hoặc đăng ký bằng email</FieldSeparator>

            <form noValidate onSubmit={onSubmit}>
                <FieldGroup className="gap-4">
                    <Controller
                        name="fullName"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <AuthTextField
                                {...field}
                                label="Họ và tên"
                                icon={LuUserRound}
                                autoComplete="name"
                                placeholder="Nguyễn Văn An"
                                error={fieldState.error?.message}
                                disabled={isPending}
                            />
                        )}
                    />
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
                                disabled={isPending}
                            />
                        )}
                    />
                    <Controller
                        name="password"
                        control={form.control}
                        // Đổi mật khẩu thì kiểm tra lại ô nhập lại
                        rules={{ deps: 'confirmPassword' }}
                        render={({ field, fieldState }) => (
                            <AuthTextField
                                {...field}
                                label="Mật khẩu"
                                type="password"
                                icon={LuLockKeyhole}
                                autoComplete="new-password"
                                placeholder="Tạo mật khẩu"
                                description="Tối thiểu 8 ký tự, gồm cả chữ và số."
                                error={fieldState.error?.message}
                                disabled={isPending}
                            />
                        )}
                    />
                    <Controller
                        name="confirmPassword"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <AuthTextField
                                {...field}
                                label="Nhập lại mật khẩu"
                                type="password"
                                icon={LuLockKeyhole}
                                autoComplete="new-password"
                                placeholder="Nhập lại mật khẩu"
                                error={fieldState.error?.message}
                                disabled={isPending}
                            />
                        )}
                    />
                    <Controller
                        name="acceptTerms"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <AuthCheckboxField
                                ref={field.ref}
                                name={field.name}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                label={
                                    <span>
                                        Tôi đồng ý với <strong className="font-medium text-main">Điều khoản sử dụng</strong>{' '}
                                        và <strong className="font-medium text-main">Chính sách bảo mật</strong> của Toeco.
                                    </span>
                                }
                                error={fieldState.error?.message}
                                disabled={isPending}
                            />
                        )}
                    />

                    {error && (
                        <Alert variant="destructive" className="bg-destructive/5 border-destructive/30">
                            <LuCircleAlert aria-hidden="true" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <Button type="submit" variant="primary" disabled={isPending} className="gap-2 w-full h-13">
                        {pendingMethod === 'email' && (
                            <LuLoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                        )}
                        {pendingMethod === 'email' ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
