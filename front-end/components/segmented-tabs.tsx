'use client';

import { useLayoutEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SegmentedTabsProps<T extends string> {
    options: readonly { value: T; label: string }[];
    value: T;
    onChange: (value: T) => void;
    /** Số đếm hiển thị cạnh nhãn; bỏ qua thì không có badge. */
    counts?: Partial<Record<T, number>>;
    ariaLabel: string;
    className?: string;
}

/** Nhóm tab dạng pill trên nền `main`, pill vàng trượt theo tab đang chọn. */
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

    useLayoutEffect(() => {
        const group = groupRef.current;
        const indicator = indicatorRef.current;
        if (!group || !indicator) return;

        // Vị trí pill phụ thuộc độ rộng nhãn/số đếm nên phải đo DOM, không làm bằng class tĩnh được.
        const place = () => {
            const active = group.querySelector<HTMLElement>('[aria-pressed="true"]');
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
        group.querySelectorAll('button').forEach((button) => observer.observe(button));
        return () => observer.disconnect();
    }, [value, options]);

    return (
        <div
            ref={groupRef}
            role="group"
            aria-label={ariaLabel}
            className={cn('relative flex flex-wrap gap-1 bg-main p-1 rounded-lg', className)}
        >
            <span
                ref={indicatorRef}
                aria-hidden="true"
                className="top-0 left-0 absolute bg-sub3 shadow-sm rounded-md w-(--w) h-(--h) translate-x-(--x) translate-y-(--y) data-[ready=true]:transition-[translate,width,height] data-[ready=true]:duration-300 data-[ready=true]:ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none!"
            />
            {options.map((option) => {
                const isActive = option.value === value;
                const count = counts?.[option.value];
                return (
                    <button
                        key={option.value}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => onChange(option.value)}
                        className={cn(
                            'z-10 relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-semibold text-xs transition-[color,background-color,scale] duration-200 cursor-pointer active:scale-95 motion-reduce:transition-none',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                            isActive ? 'text-main' : 'text-white hover:bg-white/15',
                        )}
                    >
                        <span>{option.label}</span>
                        {count !== undefined && (
                            <span
                                // Đổi key khi số đếm đổi để badge chạy lại hiệu ứng "đóng dấu".
                                key={count}
                                className={cn(
                                    'px-1.5 rounded-full font-semibold text-xs leading-4 tabular-nums transition-colors duration-200 animate-stamp motion-reduce:animate-none',
                                    isActive ? 'bg-main text-sub3' : 'bg-white text-main',
                                )}
                            >
                                {count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
