'use client';

import { useState } from 'react';
import { LuBot, LuCalendarClock, LuCheck, LuFlame } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { DEFAULT_DAY_TASKS, WEEK_DAYS } from './schedule.data';
import { FaCheck } from 'react-icons/fa';
import { BsFire } from 'react-icons/bs';

/** Lịch tuần + giải thích của AI: bấm "Hôm nay tôi bận" để dời bài trọng tâm sang ngày sau. */
export default function LandingScheduleWeek() {
    const [focusDay, setFocusDay] = useState(1); // 0 = T2 (đã xong), 1 = T3

    return (
        <div className="flex flex-col gap-6 h-full">
            <div className="flex flex-col flex-1 gap-4 bg-card shadow-[6px_6px_0_0_#000] px-6 py-4 border-2 border-black rounded-2xl">
                <div className="flex flex-wrap justify-between items-center gap-3">
                    <div>
                        <h3 className="mb-1 font-semibold text-main">Lịch tuần 3</h3>
                        <p className="inline-flex items-center gap-1 font-semibold text-subText text-sm">
                            <BsFire aria-hidden="true" className="size-4 text-sub3" />
                            Chuỗi 14 ngày · Nhắc học 20:00
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setFocusDay((d) => (d < 6 ? d + 1 : 1))}
                        className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'gap-1.5 bg-card')}
                    >
                        Hôm nay tôi bận
                    </button>
                </div>

                <ol className="flex-1 gap-1.5 sm:gap-2 grid grid-cols-7">
                    {WEEK_DAYS.map((day, i) => {
                        const done = i === 0;
                        const focus = i === focusDay;
                        return (
                            <li
                                key={day}
                                aria-current={focus ? 'date' : undefined}
                                className={cn(
                                    'flex flex-col justify-between items-center gap-2 p-1.5 sm:p-2 border-2 border-black rounded-lg min-h-24 text-center transition-all',
                                    done && 'bg-success',
                                    focus && 'bg-sub3 -translate-y-1 shadow-[3px_3px_0_0_#000]',
                                    !done && !focus && 'bg-canvas',
                                )}
                            >
                                <span className="font-bold text-[#333] text-sm">{day}</span>
                                <span className="font-semibold text-main text-xs">
                                    {done ? (
                                        <FaCheck aria-label="Đã xong" className="mx-auto size-6" />
                                    ) : focus ? (
                                        <>
                                            <b>Part 3</b>
                                            <br />
                                            45p
                                        </>
                                    ) : (
                                        DEFAULT_DAY_TASKS[i]
                                    )}
                                </span>
                            </li>
                        );
                    })}
                </ol>
            </div>

            <div
                aria-live="polite"
                className="flex items-start gap-3 bg-sub1 shadow-[6px_6px_0_0_#000] p-4 border-2 border-black rounded-2xl font-semibold text-sm"
            >
                <LuBot aria-hidden="true" className="size-5 shrink-0" />
                <p className="flex gap-2 text-subText">
                    <span className='text-main'>AI giải thích: </span>
                    {focusDay === 1
                        ? 'Part 3 và lỗi thiếu mạo từ đang kéo điểm xuống nhiều nhất nên được xếp vào Thứ 3, ngày bạn rảnh 45 phút.'
                        : `Đã dời bài trọng tâm sang ${WEEK_DAYS[focusDay]}. Mục tiêu tuần và chuỗi ngày học vẫn giữ nguyên.`}
                </p>
            </div>
        </div>
    );
}
