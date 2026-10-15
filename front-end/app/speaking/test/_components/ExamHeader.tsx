'use client';

import { LuAudioLines, LuCheck, LuLock, LuLogOut, LuMic, LuShieldCheck } from 'react-icons/lu';
import type { AttemptMode } from '@/lib/domain/types';
import { formatTime } from '../utils';

const MODE_LABEL: Record<AttemptMode, string> = {
    cbt: 'Thi thử chuẩn',
    timed: 'Luyện có thời gian',
    guided: 'Học có hướng dẫn',
};

interface ExamHeaderProps {
    title: string;
    mode: AttemptMode;
    prepSec: number;
    speakSec: number;
    secondsRemaining: number;
    onOpenExitModal: () => void;
}

export default function ExamHeader({ title, mode, prepSec, speakSec, secondsRemaining, onOpenExitModal }: ExamHeaderProps) {
    const isFinished = secondsRemaining <= 0;

    return (
        <header className="border rounded-xl w-full overflow-hidden">
            {/* ===== Thanh trên: tên bài thi + trạng thái + thoát ===== */}
            <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 bg-main shadow-main/20 shadow-lg px-4 sm:px-6 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3">
                        <span className="flex justify-center items-center bg-sub3 shadow-sm rounded-xl size-9 text-main">
                            <LuAudioLines className="size-5" aria-hidden="true" />
                        </span>
                        <div className="leading-tight">
                            <p className="font-medium text-sub2 text-[11px] uppercase tracking-widest">Bài thi</p>
                            <h1 className="font-semibold text-sub1 text-base sm:text-lg tracking-tight">
                                {title}
                            </h1>
                        </div>
                    </div>

                    <span className="hidden md:block bg-sub2/30 w-px h-8" aria-hidden="true" />

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 bg-sub3/15 px-3 py-1 border border-sub3/40 rounded-full font-semibold text-sub3 text-xs">
                            <span className="relative flex size-2">
                                <span className="inline-flex absolute bg-sub3 opacity-75 rounded-full size-full animate-ping" />
                                <span className="inline-flex relative bg-sub3 rounded-full size-2" />
                            </span>
                            <span className="uppercase tracking-wider">Chế độ: {MODE_LABEL[mode]}</span>
                        </div>

                        <span className="inline-flex items-center gap-1.5 bg-sub1/10 px-2.5 py-1 rounded-full font-medium text-sub1/80 text-xs">
                            <LuLock className="size-3.5 text-sub2" aria-hidden="true" />
                            Không trợ giúp • Khóa nhảy câu
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-1.5 font-medium text-sub1/80 text-xs">
                        <LuShieldCheck className="size-4 text-sub3" aria-hidden="true" />
                        <span>Đã lưu trên trình duyệt này</span>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenExitModal}
                        className="inline-flex items-center gap-1.5 bg-transparent hover:bg-sub3 px-3.5 py-2 border border-sub2/50 hover:border-sub3 rounded-lg focus-visible:outline-none focus-visible:ring-sub3 focus-visible:ring-2 focus-visible:ring-offset-main focus-visible:ring-offset-2 font-semibold text-sub1 hover:text-main text-xs transition-colors duration-200 cursor-pointer"
                    >
                        <LuLogOut className="size-4" aria-hidden="true" />
                        <span>Thoát bài thi</span>
                    </button>
                </div>
            </div>

            {/* ===== Ribbon: tiến trình các bước + đồng hồ ===== */}
            <div className="bg-white shadow-2xl px-4 sm:px-6 py-3.5 border-sub2/30 border-b">
                <div className="flex md:flex-row flex-col justify-between items-center gap-4 mx-auto max-w-6xl">
                    <ol className="flex items-center gap-2 pb-1 md:pb-0 w-full md:w-auto overflow-x-auto text-xs">
                        <li className="flex items-center gap-1.5 font-medium text-main/70 shrink-0">
                            <span className="flex justify-center items-center bg-sub2 rounded-full size-5 text-white">
                                <LuCheck className="size-3" aria-hidden="true" />
                            </span>
                            <span>1. Hướng dẫn</span>
                        </li>

                        <li aria-hidden="true" className="bg-sub2/60 w-4 h-px shrink-0" />

                        <li className="flex items-center gap-1.5 font-medium text-main/70 shrink-0">
                            <span className="flex justify-center items-center bg-sub2 rounded-full size-5 text-white">
                                <LuCheck className="size-3" aria-hidden="true" />
                            </span>
                            <span>2. Chuẩn bị ({prepSec}s)</span>
                        </li>

                        <li aria-hidden="true" className="bg-sub2/60 w-4 h-px shrink-0" />

                        <li
                            aria-current="step"
                            className="flex items-center gap-2 bg-main shadow-main/25 shadow-md px-3 py-1 rounded-full font-semibold text-sub1 shrink-0"
                        >
                            <span className="relative flex size-2">
                                <span
                                    className={`absolute inline-flex size-full rounded-full bg-sub3 opacity-75 ${
                                        isFinished ? '' : 'animate-ping'
                                    }`}
                                />
                                <span className="inline-flex relative bg-sub3 rounded-full size-2" />
                            </span>
                            <span>3. Trả lời ({speakSec}s)</span>
                        </li>

                        <li aria-hidden="true" className="bg-sub2/60 w-4 h-px shrink-0" />

                        <li className="flex items-center gap-1.5 font-medium text-main/50 shrink-0">
                            <span className="flex justify-center items-center border border-sub2/60 rounded-full size-5 text-[11px]">
                                4
                            </span>
                            <span>Chốt bài</span>
                        </li>
                    </ol>

                    <div className="flex justify-between md:justify-end items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col text-left md:text-right">
                            <span className="font-semibold text-main text-[11px] uppercase tracking-wider">
                                Thời gian trả lời còn lại
                            </span>
                            <span className="flex md:justify-end items-center gap-1 text-main/70 text-xs">
                                <LuMic className="size-3.5 text-sub2" aria-hidden="true" />
                                Hãy nói to, rõ ràng vào micro
                            </span>
                        </div>

                        <div
                            className={`flex items-center gap-2.5 rounded-xl border px-4 py-1.5 shadow-sm transition-colors ${
                                isFinished ? 'border-sub2 bg-white' : 'border-sub3 bg-main'
                            }`}
                        >
                            <span
                                className={`size-2.5 rounded-full ${
                                    isFinished ? 'bg-sub2' : 'animate-ping bg-sub3'
                                }`}
                            />
                            <span
                                role="timer"
                                aria-live="off"
                                className={`font-mono text-xl font-bold tabular-nums tracking-tight ${
                                    isFinished ? 'text-main' : 'text-sub3'
                                }`}
                            >
                                {formatTime(secondsRemaining)}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
