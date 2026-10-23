'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LuHardDrive, LuX } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';
import { cn } from '@/lib/utils';

const DISMISSED_KEY = 'toeco:guest-notice-dismissed';

/** Nhắc khách rằng bài làm chỉ nằm trên trình duyệt này và không được chuyển sang tài khoản khi đăng ký. */
export function GuestDataNotice() {
    const user = useCurrentUser();
    // Server/storage bị chặn → coi như chưa đóng; banner chỉ render sau khi đọc xong phiên nên không lệch hydrate
    const [dismissed, setDismissed] = useState(() => {
        try {
            return localStorage.getItem(DISMISSED_KEY) === '1';
        } catch {
            return false;
        }
    });

    const dismiss = () => {
        setDismissed(true);
        try {
            localStorage.setItem(DISMISSED_KEY, '1');
        } catch {
            // Không ghi được thì chỉ ẩn trong phiên này
        }
    };

    // chờ đọc xong phiên để người đã đăng nhập không thấy banner nháy lên
    if (user !== null || dismissed) return null;

    return (
        <aside
            aria-labelledby="guest-data-notice-title"
            className="flex sm:flex-row flex-col sm:items-center gap-3 bg-sub1 p-4 border border-sub2/30 rounded-xl"
        >
            <div className="flex flex-1 items-start gap-3 min-w-0">
                <span className="flex justify-center items-center bg-main rounded-lg size-9 text-sub3 shrink-0">
                    <LuHardDrive className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5 min-w-0">
                    <p id="guest-data-notice-title" className="font-semibold text-main text-sm">
                        Bạn đang làm bài ở chế độ khách
                    </p>
                    <p className="font-medium text-subText text-xs leading-relaxed">
                        Bài làm chỉ lưu trên trình duyệt này và sẽ không được chuyển sang khi bạn đăng ký tài khoản.
                    </p>
                </div>
            </div>
            <div className="flex items-center self-end sm:self-auto gap-2 shrink-0">
                <Link href="/register" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                    Đăng ký
                </Link>
                <button
                    type="button"
                    aria-label="Đóng thông báo"
                    onClick={dismiss}
                    className={cn(
                        'flex justify-center items-center rounded-lg size-8 text-main transition-colors',
                        'hover:bg-sub2/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    )}
                >
                    <LuX className="size-4" aria-hidden="true" />
                </button>
            </div>
        </aside>
    );
}
