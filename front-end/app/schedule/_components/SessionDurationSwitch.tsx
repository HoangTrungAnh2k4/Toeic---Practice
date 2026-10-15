'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SESSION_DURATION_OPTIONS } from '../utils';

interface SessionDurationSwitchProps {
    /** `study_plans.minutes_per_day` — mỗi ngày một buổi. */
    defaultValue: number;
}

/** shortcut: chỉ đổi trên giao diện, chưa ghi `minutes_per_day`; nối khi có API cập nhật lộ trình. */
export default function SessionDurationSwitch({ defaultValue }: SessionDurationSwitchProps) {
    const [value, setValue] = useState(defaultValue);

    return (
        <div className="flex flex-wrap justify-between items-center gap-3 bg-sub1/50 p-3 rounded-lg">
            <span id="session-duration-label" className="font-semibold text-main text-xs">
                Thời lượng mỗi buổi học
            </span>
            <div
                role="group"
                aria-labelledby="session-duration-label"
                className="inline-flex gap-1 bg-white p-1 border border-sub2/30 rounded-lg"
            >
                {SESSION_DURATION_OPTIONS.map((option) => {
                    const isActive = option === value;

                    return (
                        <button
                            key={option}
                            type="button"
                            aria-pressed={isActive}
                            onClick={() => setValue(option)}
                            className={cn(
                                'px-3 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer',
                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                                isActive ? 'bg-main text-sub3 shadow-sm' : 'text-subText hover:bg-sub1 hover:text-main',
                            )}
                        >
                            {option} phút
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
