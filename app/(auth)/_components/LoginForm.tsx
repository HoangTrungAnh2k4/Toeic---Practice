'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCircleAlert, LuLoaderCircle, LuLockKeyhole, LuMail } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FieldGroup, FieldSeparator } from '@/components/ui/field';
import { continueWithGoogle, signInWithEmail } from '../_lib/auth';
import { loginSchema } from '../_lib/schemas';
import { useAuthAction } from '../_lib/useAuthAction';
import AuthCheckboxField from './AuthCheckboxField';
import AuthTextField from './AuthTextField';
import GoogleAuthButton from './GoogleAuthButton';

export default function LoginForm() {
    const { run, error, isPending, pendingMethod } = useAuthAction();
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: '', password: '', remember: true },
    });

    const onSubmit = form.handleSubmit((values) => run('email', () => signInWithEmail(values)));

    return (
        <div className="flex flex-col gap-6">
            <GoogleAuthButton
                label="Tiếp tục với Google"
                pending={pendingMethod === 'google'}
                disabled={isPending}
                onClick={() => run('google', continueWithGoogle)}
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
                                disabled={isPending}
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
                                disabled={isPending}
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

                    <Button type="submit" variant="primary" disabled={isPending} className="gap-2 mt-2" size={'lg'}>
                        {pendingMethod === 'email' && (
                            <LuLoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" />
                        )}
                        {pendingMethod === 'email' ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </Button>
                </FieldGroup>
            </form>
        </div>
    );
}
