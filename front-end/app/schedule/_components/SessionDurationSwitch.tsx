'use client';

import { useState } from 'react';
import { LuLoaderCircle } from 'react-icons/lu';
import { updatePlanMinutes } from '@/lib/data/user-data';
import { cn } from '@/lib/utils';
import { SESSION_DURATION_OPTIONS } from '../utils';

interface SessionDurationSwitchProps {
    planId: string;
    /** `study_plans.minutes_per_day` — mỗi ngày một buổi. */
    defaultValue: number;
}

/** Đổi ngay trên giao diện rồi ghi `minutes_per_day`; lỗi thì trả về giá trị cũ. */
export default function SessionDurationSwitch({ planId, defaultValue }: SessionDurationSwitchProps) {
    const [value, setValue] = useState(defaultValue);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(false);

    const select = async (option: number) => {
        if (option === value || saving) return;
        const previous = value;
        setValue(option);
        setSaving(true);
        setError(false);
        try {
            await updatePlanMinutes(planId, option);
        } catch {
            setValue(previous);
            setError(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-2 bg-sub1/50 p-3 rounded-lg">
            <div className="flex flex-wrap justify-between items-center gap-3">
                <span id="session-duration-label" className="flex items-center gap-1.5 font-semibold text-main text-xs">
                    Thời lượng mỗi buổi học
                    {saving && <LuLoaderCircle className="size-3.5 text-sub2 animate-spin" aria-label="Đang lưu" />}
                </span>
                <div
                    role="group"
                    aria-labelledby="session-duration-label"
                    aria-busy={saving}
                    className="inline-flex gap-1 bg-white p-1 border border-sub2/30 rounded-lg"
                >
                    {SESSION_DURATION_OPTIONS.map((option) => {
                        const isActive = option === value;

                        return (
                            <button
                                key={option}
                                type="button"
                                aria-pressed={isActive}
                                disabled={saving}
                                onClick={() => select(option)}
                                className={cn(
                                    'px-3 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer disabled:cursor-wait',
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
            {error && (
                <p role="alert" className="font-medium text-destructive text-xs">
                    Không lưu được thời lượng. Vui lòng thử lại.
                </p>
            )}
        </div>
    );
}
