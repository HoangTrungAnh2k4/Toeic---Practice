'use client';

import { LuMic } from 'react-icons/lu';

import { cn } from '@/lib/utils';

interface AudioCaptureHudProps {
    currentSeconds?: number;
    totalSeconds?: number;
}

// Mỗi cột là một mốc thời gian: cột đã qua tô vàng, cột chưa tới để mờ.
const WAVE_BARS = [
    'h-5',
    'h-8',
    'h-12',
    'h-7',
    'h-14',
    'h-10',
    'h-6',
    'h-12',
    'h-16',
    'h-9',
    'h-5',
    'h-11',
    'h-14',
    'h-8',
    'h-6',
    'h-10',
    'h-13',
    'h-16',
    'h-7',
    'h-9',
    'h-12',
    'h-5',
    'h-8',
    'h-14',
    'h-10',
    'h-6',
    'h-12',
    'h-9',
    'h-7',
    'h-11',
    'h-5',
    'h-8',
];

const METER_SEGMENTS = 10;
const METER_ACTIVE = 6;

export default function AudioCaptureHud({ currentSeconds = 12, totalSeconds = 30 }: AudioCaptureHudProps) {
    const percentage = Math.min(100, Math.round((currentSeconds / totalSeconds) * 100));
    const playedBars = Math.round((percentage / 100) * WAVE_BARS.length);
    const remainingSeconds = Math.max(0, totalSeconds - currentSeconds);

    return (
        <div className="flex flex-col gap-4 bg-white p-4 border border-sub1 rounded-2xl h-full">
            {/* Recording console: waveform đóng vai trò timeline */}
            <section
                aria-label="Bản ghi âm đang thực hiện"
                className="flex flex-col gap-5 bg-main p-5 rounded-xl text-sub1"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 font-medium text-sm">
                            <span className="relative flex size-2.5">
                                <span className="inline-flex absolute bg-sub3 opacity-60 rounded-full size-full motion-safe:animate-ping" />
                                <span className="inline-flex relative bg-sub3 rounded-full size-2.5" />
                            </span>
                            Đang ghi âm
                        </span>
                        <span className="flex items-center gap-1.5 text-sub2 text-xs">
                            <LuMic className="size-3.5" aria-hidden="true" />
                            Tín hiệu ổn định, 48 kHz
                        </span>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold tabular-nums text-sub3 text-3xl leading-none">
                            {remainingSeconds}s
                        </p>
                        <p className="mt-1 text-sub2 text-xs">còn lại</p>
                    </div>
                </div>

                {/* Waveform timeline */}
                <div>
                    <div
                        role="progressbar"
                        aria-label="Tiến độ bài nói"
                        aria-valuenow={percentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        className="flex items-center gap-1 w-full h-20"
                    >
                        {WAVE_BARS.map((heightClass, idx) => {
                            const isPlayed = idx < playedBars;
                            const isCurrent = idx === playedBars;

                            return (
                                <span
                                    key={idx}
                                    className={cn(
                                        'flex-1 rounded-full transition-colors duration-300',
                                        heightClass,
                                        isPlayed && 'bg-sub3',
                                        isCurrent && 'bg-sub1 motion-safe:animate-pulse',
                                        !isPlayed && !isCurrent && 'bg-sub2/40',
                                    )}
                                />
                            );
                        })}
                    </div>
                    <div className="flex justify-between mt-2 tabular-nums text-sub2 text-xs">
                        <span>0s</span>
                        <span>{Math.round(totalSeconds / 2)}s</span>
                        <span>{totalSeconds}s</span>
                    </div>
                </div>
            </section>

            {/* Input level */}
            <div className="flex flex-col gap-2 px-1">
                <div className="flex justify-between items-center text-main text-xs">
                    <span className="font-semibold">Âm lượng micro</span>
                    <span className="font-semibold">-12 dB, mức tốt</span>
                </div>
                <div className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: METER_SEGMENTS }, (_, idx) => (
                        <span
                            key={idx}
                            className={cn(
                                'flex-1 rounded-sm h-2',
                                idx < METER_ACTIVE ? 'bg-main' : 'bg-sub1',
                                idx >= METER_SEGMENTS - 2 && 'bg-sub3/40',
                            )}
                        />
                    ))}
                </div>
                <p className="text-main/70 text-xs leading-relaxed">
                    Giữ tay xa micro để tránh tiếng ồn lẫn vào bài nói.
                </p>
            </div>

            {/* Auto-submit notice */}
            <div className="flex items-start gap-2.5 bg-sub1/60 mt-auto p-3 border-sub3 border-l-4 rounded-r-lg">
                <p className="text-main/80 text-xs leading-relaxed">
                    <span className="font-semibold text-main">Tự động nộp khi hết giờ.</span> Bài nói được chốt lúc
                    00:00 và chuyển sang câu tiếp theo, bạn không thể thu âm lại.
                </p>
            </div>
        </div>
    );
}
