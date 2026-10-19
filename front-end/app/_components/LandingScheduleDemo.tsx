'use client';

import { useState } from 'react';
import { LuArrowRight, LuCheck, LuSparkles, LuTimer } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const START_DAY = 1;

/** Demo lộ trình: bấm "Hôm nay tôi bận" để dời buổi Part 3 sang ngày kế tiếp. Heading truyền vào qua children. */
export default function LandingScheduleDemo({ children }: { children: React.ReactNode }) {
    const [taskDay, setTaskDay] = useState(START_DAY);
    const isLastDay = taskDay === DAYS.length - 1;
    const moved = taskDay !== START_DAY;

    return (
        <div className="items-center gap-10 grid lg:grid-cols-[2fr_3fr]">
            <div className="flex flex-col items-start gap-6">
                {children}
                <button
                    type="button"
                    disabled={isLastDay}
                    onClick={() => setTaskDay((day) => day + 1)}
                    className={cn(buttonVariants({ variant: 'third', size: 'lg' }), 'gap-2 bg-card')}
                >
                    {isLastDay ? 'Hết tuần rồi' : 'Hôm nay tôi bận'}
                    <LuArrowRight aria-hidden="true" className="size-4" />
                </button>
            </div>

            <div className="flex flex-col gap-4 bg-card shadow-[8px_8px_0_0_var(--sub2)] p-5 border-2 border-black rounded-xl min-w-0">
                <div className="flex justify-between items-center gap-3">
                    <p className="font-semibold text-main">Tuần 3, mục tiêu 160</p>
                    <span className="flex items-center gap-1 bg-sub3 px-2 py-0.5 border-2 border-black rounded-md font-semibold text-main text-sm">
                        <LuTimer aria-hidden="true" className="size-4" />
                        12 ngày
                    </span>
                </div>

                <ol className="gap-1.5 sm:gap-2 grid grid-cols-7">
                    {DAYS.map((day, index) => {
                        const isDone = index === 0;
                        const hasTask = index === taskDay;
                        return (
                            <li key={day} className="flex flex-col items-center gap-1.5">
                                <span className={cn('font-semibold text-xs', hasTask ? 'text-main' : 'text-subText')}>{day}</span>
                                <span
                                    className={cn(
                                        'place-items-center grid border-2 border-black rounded-lg w-full h-16 text-center',
                                        isDone && 'bg-success',
                                        hasTask && 'bg-sub3 shadow-[3px_3px_0_0_#000] motion-safe:animate-stamp',
                                        !isDone && !hasTask && 'bg-canvas',
                                    )}
                                    key={hasTask ? `task-${taskDay}` : day} // đổi key để animation chạy lại mỗi lần dời
                                >
                                    {isDone && <LuCheck aria-label="Đã xong" className="size-4" />}
                                    {hasTask && (
                                        <span className="font-bold text-main text-[0.6875rem] leading-tight">
                                            Part 3<br />45&apos;
                                        </span>
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ol>

                <p className="flex items-start gap-2 bg-canvas px-4 py-3 rounded-lg text-main text-sm" aria-live="polite">
                    <LuSparkles aria-hidden="true" className="mt-0.5 size-4 text-sub2 shrink-0" />
                    {moved
                        ? `Đã dời Part 3 sang ${DAYS[taskDay]}. Các buổi sau tự lùi theo, mục tiêu 160 vẫn kịp.`
                        : 'Part 3 đang kéo điểm Speaking xuống nhiều nhất, nên được xếp vào ngày bạn rảnh 45 phút.'}
                </p>
            </div>
        </div>
    );
}
