'use client';

import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type DemoMistake = {
    id: string;
    level: string;
    levelTone: string;
    title: string;
    repeats: number;
    example: React.ReactNode;
    tilt: string;
};

const MISTAKES: DemoMistake[] = [
    {
        id: 'article',
        level: 'Lớn',
        levelTone: 'bg-sub3 text-main',
        title: 'Thiếu mạo từ a/an/the',
        repeats: 9,
        example: (
            <>
                I work at <del>company</del> <strong>a company</strong>
            </>
        ),
        tilt: 'sm:-rotate-2',
    },
    {
        id: 'ending',
        level: 'Vừa',
        levelTone: 'bg-main text-white',
        title: 'Nuốt âm cuối /s/ /t/',
        repeats: 6,
        example: '"works", "last week"',
        tilt: 'sm:rotate-1',
    },
    {
        id: 'pause',
        level: 'Nhỏ',
        levelTone: 'bg-sub1 text-main',
        title: 'Ngắt nghỉ sai chỗ',
        repeats: 4,
        example: 'Part 1, đọc to đoạn văn',
        tilt: 'sm:-rotate-1',
    },
];

/** Demo sổ lỗi: bấm "Luyện sửa" để đóng dấu đã sửa, bộ đếm lỗi đang mở giảm theo. */
export default function LandingMistakesDemo() {
    const [fixed, setFixed] = useState<string[]>([]);
    const open = MISTAKES.length - fixed.length;

    return (
        <div className="flex flex-col gap-6 mx-auto w-full max-w-300">
            <ul className="gap-6 grid md:grid-cols-3">
                {MISTAKES.map(({ id, level, levelTone, title, repeats, example, tilt }) => {
                    const isFixed = fixed.includes(id);
                    return (
                        <li
                            key={id}
                            className={cn(
                                'relative flex flex-col items-start gap-1.5 bg-[repeating-linear-gradient(transparent_0_26px,#ccc_27px,transparent_28px)] bg-white shadow-[6px_6px_0_0_#F5B841] p-5 border rounded-sm',
                                tilt,
                            )}
                        >
                            <span className={cn('px-1.5 py-0.5 border-2 border-black rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider', levelTone)}>
                                {level}
                            </span>
                            <h3 className={cn('mt-1 font-semibold text-main text-lg', isFixed && 'line-through decoration-2')}>{title}</h3>
                            <p className="font-medium text-subText text-sm">Lặp lại {repeats} lần</p>
                            <p className="text-main [&_del]:text-subText text-sm">{example}</p>
                            <button
                                type="button"
                                disabled={isFixed}
                                onClick={() => setFixed((prev) => [...prev, id])}
                                className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'bg-card mt-3')}
                            >
                                {isFixed ? 'Đã luyện' : 'Luyện sửa'}
                            </button>

                            {isFixed && (
                                <span className="right-4 bottom-4 absolute flex items-center gap-1.5 bg-success px-3 py-1 border-2 border-black rounded-md font-bold text-black text-sm uppercase tracking-wider -rotate-12 motion-safe:animate-stamp">
                                    <LuCheck aria-hidden="true" className="size-4" />
                                    Đã sửa
                                </span>
                            )}
                        </li>
                    );
                })}
            </ul>

            <p className="flex flex-wrap items-center gap-2 font-semibold text-white text-sm" aria-live="polite">
                Lỗi đang mở:
                <span className="bg-main px-2 py-0.5 rounded-md text-sub3">{open}</span>
                <span className="font-hand font-normal text-[#999] text-lg">
                    {open > 0 ? 'bấm "Luyện sửa" để đóng dấu' : 'sạch sổ! Đây là cách Toeco giúp bạn lên điểm'}
                </span>
                {open === 0 && (
                    <button type="button" onClick={() => setFixed([])} className="text-sub3 text-xs underline cursor-pointer">
                        Làm lại
                    </button>
                )}
            </p>
        </div>
    );
}
