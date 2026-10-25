'use client';

import { type ReactNode, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export interface SegmentedTabOption<T extends string> {
    value: T;
    label: string;
    /** Icon react-icons dạng element (`<LuMic />`), truyền được từ Server Component. */
    icon?: ReactNode;
    /** Có `href` thì tab là link (lọc qua URL), không thì là nút gọi `onChange`. */
    href?: string;
}

interface SegmentedTabsProps<T extends string> {
    options: readonly SegmentedTabOption<T>[];
    value: T;
    onChange?: (value: T) => void;
    /** Số đếm hiển thị cạnh nhãn; bỏ qua thì không có badge. */
    counts?: Partial<Record<T, number>>;
    ariaLabel: string;
    className?: string;
}

/** Nhóm tab dạng pill trên nền `main`, pill vàng trượt theo tab đang chọn. Dùng cho mọi nav lọc dạng tab. */
export function SegmentedTabs<T extends string>({
    options,
    value,
    onChange,
    counts,
    ariaLabel,
    className,
}: SegmentedTabsProps<T>) {
    const groupRef = useRef<HTMLDivElement>(null);
    const indicatorRef = useRef<HTMLSpanElement>(null);
    // Tab link chờ server render lại mới có `value` mới; giữ tab vừa bấm để pill trượt ngay.
    const [pending, setPending] = useState<T | null>(null);
    const [prevValue, setPrevValue] = useState(value);
    if (prevValue !== value) {
        setPrevValue(value);
        setPending(null);
    }
    const current = pending ?? value;
    const isNav = options.some((option) => option.href);

    useLayoutEffect(() => {
        const group = groupRef.current;
        const indicator = indicatorRef.current;
        if (!group || !indicator) return;

        // Vị trí pill phụ thuộc độ rộng nhãn/số đếm nên phải đo DOM, không làm bằng class tĩnh được.
        const place = () => {
            const active = group.querySelector<HTMLElement>('[data-active="true"]');
            if (!active) return;
            indicator.style.setProperty('--x', `${active.offsetLeft}px`);
            indicator.style.setProperty('--y', `${active.offsetTop}px`);
            indicator.style.setProperty('--w', `${active.offsetWidth}px`);
            indicator.style.setProperty('--h', `${active.offsetHeight}px`);
            // Bật transition sau lần đặt đầu tiên để pill không trượt từ góc trái lúc mount.
            if (!indicator.dataset.ready) requestAnimationFrame(() => (indicator.dataset.ready = 'true'));
        };

        place();
        const observer = new ResizeObserver(place);
        observer.observe(group);
        group.querySelectorAll('[data-tab]').forEach((tab) => observer.observe(tab));
        return () => observer.disconnect();
    }, [current, options.length]);

    const Wrapper = isNav ? 'nav' : 'div';

    return (
        <Wrapper
            ref={groupRef}
            role={isNav ? undefined : 'group'}
            aria-label={ariaLabel}
            className={cn('relative flex flex-wrap gap-1 bg-main p-1 rounded-lg', className)}
        >
            <span
                ref={indicatorRef}
                aria-hidden="true"
                className="top-0 left-0 absolute bg-sub3 shadow-sm rounded-md w-(--w) h-(--h) translate-x-(--x) translate-y-(--y) data-[ready=true]:transition-[translate,width,height] data-[ready=true]:duration-300 data-[ready=true]:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none!"
            />
            {options.map((option) => {
                const isActive = option.value === current;
                const count = counts?.[option.value];
                const className = cn(
                    'inline-flex z-10 relative items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs active:scale-95 transition-[color,background-color,scale] motion-reduce:transition-none duration-200 cursor-pointer [&_svg]:size-3.5 [&_svg]:shrink-0',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                    isActive ? 'text-main' : 'text-white hover:bg-white/15',
                );
                const content = (
                    <>
                        {option.icon}
                        <span>{option.label}</span>
                        {count !== undefined && (
                            <span
                                // Đổi key khi số đếm đổi để badge chạy lại hiệu ứng "đóng dấu".
                                key={count}
                                className={cn(
                                    'px-1.5 rounded-full font-semibold tabular-nums text-[0.6875rem] leading-4 transition-colors animate-stamp motion-reduce:animate-none duration-200',
                                    isActive ? 'bg-main text-sub3' : 'bg-white text-main',
                                )}
                            >
                                {count}
                            </span>
                        )}
                    </>
                );

                return option.href ? (
                    <Link
                        key={option.value}
                        href={option.href}
                        scroll={false}
                        data-tab
                        data-active={isActive}
                        aria-current={option.value === value ? 'true' : undefined}
                        onClick={() => setPending(option.value)}
                        className={className}
                    >
                        {content}
                    </Link>
                ) : (
                    <button
                        key={option.value}
                        type="button"
                        data-tab
                        data-active={isActive}
                        aria-pressed={isActive}
                        onClick={() => onChange?.(option.value)}
                        className={className}
                    >
                        {content}
                    </button>
                );
            })}
        </Wrapper>
    );
}
