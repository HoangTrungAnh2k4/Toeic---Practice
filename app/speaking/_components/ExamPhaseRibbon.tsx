'use client';

import { LuCheck } from 'react-icons/lu';
import { formatTime } from '../utils';

interface ExamPhaseRibbonProps {
    secondsRemaining: number;
}

export default function ExamPhaseRibbon({ secondsRemaining }: ExamPhaseRibbonProps) {
    const isFinished = secondsRemaining <= 0;

    return (
        <div className="border-b border-destructive/20 bg-destructive/5 px-6 py-3.5 shadow-xs">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
                {/* Steps Progression */}
                <div className="flex w-full items-center gap-2 overflow-x-auto pb-1 text-xs md:w-auto md:pb-0">
                    <div className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground opacity-80">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <LuCheck className="size-3" aria-hidden="true" />
                        </span>
                        <span>1. Hướng dẫn</span>
                    </div>

                    <span className="text-muted-foreground/60">/</span>

                    <div className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground opacity-80">
                        <span className="flex size-5 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                            <LuCheck className="size-3" aria-hidden="true" />
                        </span>
                        <span>2. Chuẩn bị (45s)</span>
                    </div>

                    <span className="text-muted-foreground/60">/</span>

                    <div className="flex shrink-0 items-center gap-2 rounded-full bg-destructive px-3 py-1 font-semibold text-white shadow-xs">
                        <span className="size-2 animate-pulse rounded-full bg-white" />
                        <span>3. ĐANG GHI ÂM (RECORDING 30s)</span>
                    </div>

                    <span className="text-muted-foreground/60">/</span>

                    <div className="flex shrink-0 items-center gap-1.5 font-medium text-muted-foreground opacity-60">
                        <span className="flex size-5 items-center justify-center rounded-full bg-muted text-[11px]">
                            4
                        </span>
                        <span>Chốt bài</span>
                    </div>
                </div>

                {/* Live Chronometer & Real-time Instruction */}
                <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
                    <div className="flex flex-col text-left md:text-right">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
                            Thời gian trả lời còn lại
                        </span>
                        <span className="text-xs text-muted-foreground">Hãy nói to, rõ ràng vào micro</span>
                    </div>

                    <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-1.5 shadow-xs">
                        <span
                            className={`size-2.5 rounded-full ${
                                isFinished ? 'bg-emerald-500' : 'animate-ping bg-destructive'
                            }`}
                        />
                        <span
                            className={`font-mono text-xl font-bold tracking-tight ${
                                isFinished ? 'text-emerald-600' : 'text-destructive'
                            }`}
                        >
                            {formatTime(secondsRemaining)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
