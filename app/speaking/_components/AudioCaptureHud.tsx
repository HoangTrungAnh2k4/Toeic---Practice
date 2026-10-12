'use client';

import { LuClock, LuMic } from 'react-icons/lu';

interface AudioCaptureHudProps {
    currentSeconds?: number;
    totalSeconds?: number;
}

export default function AudioCaptureHud({
    currentSeconds = 12,
    totalSeconds = 30,
}: AudioCaptureHudProps) {
    const percentage = Math.min(100, Math.round((currentSeconds / totalSeconds) * 100));

    // Dynamic wave bar heights for authentic animated look
    const waveBars = [
        'h-8 animate-pulse',
        'h-12 animate-pulse [animation-delay:150ms]',
        'h-16 animate-pulse [animation-delay:300ms]',
        'h-10 animate-pulse [animation-delay:100ms]',
        'h-14 animate-pulse [animation-delay:250ms]',
        'h-6 animate-pulse [animation-delay:400ms]',
        'h-12 animate-pulse [animation-delay:200ms]',
        'h-16 animate-pulse [animation-delay:350ms]',
        'h-10 animate-pulse [animation-delay:50ms]',
        'h-14 animate-pulse [animation-delay:280ms]',
        'h-8 animate-pulse [animation-delay:180ms]',
        'h-12 animate-pulse [animation-delay:320ms]',
        'h-16 animate-pulse [animation-delay:120ms]',
        'h-10 animate-pulse [animation-delay:220ms]',
        'h-7 animate-pulse [animation-delay:380ms]',
    ];

    return (
        <div className="flex h-full flex-col justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            {/* Microphone Status Header */}
            <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground sm:text-sm">
                        <LuMic className="size-4 text-emerald-600" aria-hidden="true" />
                        Microphone Input Signal
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <span className="size-2 animate-pulse rounded-full bg-emerald-600" />
                        Đang thu âm trực tiếp
                    </span>
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">
                    Micro của bạn đang nhận tín hiệu giọng nói ở mức chuẩn (-12 dB). Tránh chạm tay vào mic để không gây nhiễu tiếng ồn.
                </p>
            </div>

            {/* Dynamic Audio Waveform Visualizer */}
            <div className="flex flex-col gap-2.5 rounded-xl border border-border bg-muted/30 p-4 shadow-inner">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Biên độ âm thanh (Input Level)</span>
                    <span className="font-semibold text-emerald-600">Ổn định • 48 kHz</span>
                </div>

                {/* Animated Waveform Equalizer */}
                <div className="flex h-20 w-full items-center justify-center gap-1 overflow-hidden px-1">
                    {waveBars.map((barClass, idx) => (
                        <span
                            key={idx}
                            className={`w-1.5 rounded-full ${
                                idx % 3 === 2 ? 'bg-primary' : 'bg-emerald-500'
                            } ${barClass}`}
                        />
                    ))}
                </div>

                {/* Volume Peak Meter Segments */}
                <div className="flex w-full items-center gap-1 pt-1">
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500/30" />
                    <div className="h-2 flex-1 rounded-sm bg-emerald-500/20" />
                    <div className="h-2 flex-1 rounded-sm bg-amber-400/40" />
                    <div className="h-2 flex-1 rounded-sm bg-rose-500/20" />
                </div>

                <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>-30dB</span>
                    <span className="font-medium text-emerald-700">-12dB (Tốt)</span>
                    <span>0dB (Clip)</span>
                </div>
            </div>

            {/* Exam Warning Card */}
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-muted/40 p-3">
                <LuClock className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-foreground">Tự động nộp bài phát âm</span>
                    <span className="text-[11px] leading-relaxed text-muted-foreground">
                        Hệ thống sẽ tự động chốt tệp âm thanh ngay khi đồng hồ điểm 00:00 và chuyển tiếp sang Câu 4. Bạn không thể thu âm lại.
                    </span>
                </div>
            </div>

            {/* Response Progress Tracker */}
            <div className="flex flex-col gap-1.5 pt-1">
                <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Tiến độ bài nói</span>
                    <span className="font-semibold text-primary">
                        {currentSeconds}s / {totalSeconds}s ({percentage}%)
                    </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                        className="h-full rounded-full bg-primary transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                    />
                </div>
            </div>
        </div>
    );
}
