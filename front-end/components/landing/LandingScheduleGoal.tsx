'use client';

import { useState } from 'react';
import { LuTarget } from 'react-icons/lu';
import { cn } from '@/lib/utils';

/** Thẻ mục tiêu: kéo điểm mong muốn, lộ trình ước tính đổi theo. */
export default function LandingScheduleGoal() {
    const [target, setTarget] = useState(160);

    const level = target >= 190 ? 8 : target >= 160 ? 7 : target >= 130 ? 6 : 5;
    const stats = [
        { label: 'Lộ trình', value: `${Math.round(3 + ((target - 110) / 10) * 0.8)} tuần` },
        { label: 'Mỗi ngày', value: `${Math.round(30 + ((target - 110) / 90) * 35)} phút` },
        {
            label: 'Ưu tiên',
            value: target >= 180 ? 'Câu 11 & Bài luận' : target >= 150 ? 'Part 3 & Email' : 'Part 1–2 & Câu tranh',
            highlight: true,
        },
    ];

    return (
        <div className="flex flex-col gap-5 bg-card shadow-[6px_6px_0_0_#000] p-6 border-2 border-black rounded-2xl h-full">
            <div className="flex justify-between items-center gap-2">
                <span className="inline-flex items-center gap-1.5 font-semibold text-main text-base">
                    Mục tiêu của bạn
                </span>
                <span className="bg-success px-2 py-0.5 border-2 border-black rounded-md font-semibold text-[0.6875rem] text-black uppercase tracking-wider">
                    Level {level}
                </span>
            </div>

            <div>
                <p className="font-bold text-main text-4xl">
                    {target}
                    <span className="ml-1 text-subText text-base">/ 200</span>
                </p>
                <input
                    type="range"
                    min={110}
                    max={200}
                    step={10}
                    value={target}
                    onChange={(e) => setTarget(Number(e.target.value))}
                    aria-label="Điểm mục tiêu"
                    className="mt-3 w-full accent-main cursor-pointer"
                />
                <p className="mt-1 font-medium text-subText text-sm">Kéo để đổi mục tiêu, lộ trình tự tính lại.</p>
            </div>

            <dl className="gap-2 grid grid-cols-3 mt-auto">
                {stats.map(({ label, value, highlight }) => (
                    <div
                        key={label}
                        className={cn('p-2.5 border-2 border-black rounded-lg', highlight ? 'bg-sub3' : 'bg-canvas')}
                    >
                        <dt className="font-semibold text-[0.6875rem] text-main uppercase tracking-wider">{label}</dt>
                        <dd className="font-bold text-main text-sm">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
