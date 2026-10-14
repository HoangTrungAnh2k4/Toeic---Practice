'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuLockKeyhole, LuMail } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { loginSchema } from '../_lib/schemas';
import AuthCheckboxField from './AuthCheckboxField';
import AuthTextField from './AuthTextField';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginForm() {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: true },
    });

    const onSubmit = form.handleSubmit(() => {});

    return (
        <div className="flex flex-col gap-6">
            <GoogleAuthButton
                label="Tiếp tục với Google"
            />

            <FieldSeparator>hoặc đăng nhập bằng email</FieldSeparator>

            <form noValidate onSubmit={onSubmit}>
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

                    <Button type="submit" variant="primary" className="gap-2 mt-2" size={'lg'}>
                        Đăng nhập
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
