'use client';

import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuLockKeyhole, LuMail, LuUserRound } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { registerSchema } from '../_lib/schemas';
import { supabase } from '@/lib/supabase';
import { authErrorMessage } from '../_lib/authError';
import AuthCheckboxField from './AuthCheckboxField';
import AuthFormError from './AuthFormError';
import AuthTextField from './AuthTextField';
import GoogleAuthButton from './GoogleAuthButton';

export default function RegisterForm() {
    const router = useRouter();
    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: { fullName: '', email: '', password: '', acceptTerms: false },
    });

    const onSubmit = form.handleSubmit(async ({ fullName, email, password }) => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        if (error) return form.setError('root', { message: authErrorMessage(error) });
        // Email đã xác thực trước đó: Supabase trả user giả không có identity thay vì báo lỗi
        if (data.user?.identities?.length === 0) {
            return form.setError('root', { message: 'Email này đã được đăng ký, hãy đăng nhập' });
        }
        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
    });

    return (
        <div className="flex flex-col gap-6">
            <GoogleAuthButton label="Đăng ký bằng Google" />

            <FieldSeparator>hoặc đăng ký bằng email</FieldSeparator>

            {/* method="post": bấm trước khi hydrate thì trình duyệt submit gốc, không để mật khẩu/mã lên URL */}
            <form method="post" noValidate onSubmit={onSubmit}>
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
                                autoComplete="new-password"
                                placeholder="Tạo mật khẩu"
                                description="Tối thiểu 8 ký tự, gồm cả chữ và số."
                                error={fieldState.error?.message}
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
                                        Tôi đồng ý với{' '}
                                        <strong className="font-medium text-main">Điều khoản sử dụng</strong> và{' '}
                                        <strong className="font-medium text-main">Chính sách bảo mật</strong> của Toeco.
                                    </span>
                                }
                                error={fieldState.error?.message}
                            />
                        )}
                    />

                    <AuthFormError message={form.formState.errors.root?.message} />
                    <Button
                        type="submit"
                        variant="primary"
                        className="gap-2 w-full h-13"
                        disabled={form.formState.isSubmitting}
                    >
                        {form.formState.isSubmitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
