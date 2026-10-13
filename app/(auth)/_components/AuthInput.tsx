'use client';

import { useState } from 'react';
import type { IconType } from 'react-icons';
import { LuEye, LuEyeOff } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AuthInputProps extends React.ComponentProps<typeof Input> {
    icon: IconType;
}

/** Ô nhập có icon dẫn đầu; với `type="password"` tự thêm nút hiện/ẩn mật khẩu. */
export default function AuthInput({ icon: Icon, type, disabled, className, ...props }: AuthInputProps) {
    const [revealed, setRevealed] = useState(false);
    const isPassword = type === 'password';

    return (
        <div className="relative">
            <Icon
                aria-hidden="true"
                className="top-1/2 left-4 absolute size-4.5 text-subText -translate-y-1/2 pointer-events-none"
            />
            <Input
                type={isPassword && revealed ? 'text' : type}
                disabled={disabled}
                className={cn(
                    'bg-sub1/50 pl-11 border-sub2/45 focus-visible:border-main rounded-lg focus-visible:ring-3 focus-visible:ring-sub2/35 h-11 text-foreground',
                    isPassword && 'pr-12',
                    className,
                )}
                {...props}
            />
            {isPassword && (
                <button
                    type="button"
                    onClick={() => setRevealed((value) => !value)}
                    disabled={disabled}
                    aria-label="Hiện mật khẩu"
                    aria-pressed={revealed}
                    className="top-1/2 right-1 absolute flex justify-center items-center disabled:opacity-50 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main size-11 text-subText hover:text-main -translate-y-1/2 cursor-pointer disabled:pointer-events-none"
                >
                    {revealed ? (
                        <LuEyeOff aria-hidden="true" className="size-4" />
                    ) : (
                        <LuEye aria-hidden="true" className="size-4" />
                    )}
                </button>
            )}
        </div>
    );
}
