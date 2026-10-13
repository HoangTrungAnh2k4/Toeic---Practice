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
                className="top-1/2 left-3.5 absolute size-4 text-sub2 -translate-y-1/2 pointer-events-none"
            />
            <Input
                type={isPassword && revealed ? 'text' : type}
                disabled={disabled}
                className={cn(
                    'bg-sub1/50 focus-visible:bg-card pl-10 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 h-11 text-main',
                    isPassword && 'pr-11',
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
                    className="top-1/2 right-1.5 absolute flex justify-center items-center rounded-md size-8 text-subText hover:text-main -translate-y-1/2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main disabled:pointer-events-none disabled:opacity-50"
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
