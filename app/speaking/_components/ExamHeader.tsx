'use client';

import { LuAudioLines, LuCheck, LuLock, LuLogOut, LuMic, LuShieldCheck } from 'react-icons/lu';
import { formatTime } from '../utils';

interface ExamHeaderProps {
    secondsRemaining: number;
    onOpenExitModal: () => void;
}

export default function ExamHeader({ secondsRemaining, onOpenExitModal }: ExamHeaderProps) {
    const isFinished = secondsRemaining <= 0;

    return (
        <header className="w-full">
            {/* ===== Thanh trên: tên bài thi + trạng thái + thoát ===== */}
            <div className="flex flex-wrap justify-between items-center gap-x-6 gap-y-3 bg-[#3C3454] shadow-[#3C3454]/20 shadow-lg px-4 sm:px-6 py-3">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <div className="flex items-center gap-3">
                        <span className="flex justify-center items-center bg-[#F5B841] shadow-sm rounded-xl size-9 text-[#3C3454]">
                            <LuAudioLines className="size-5" aria-hidden="true" />
                        </span>
                        <div className="leading-tight">
                            <p className="font-medium text-[#8B84B8] text-[11px] uppercase tracking-widest">Bài thi</p>
                            <h1 className="font-semibold text-[#E8E5F5] text-base sm:text-lg tracking-tight">
                                TOEIC Speaking Mock Test 04
                            </h1>
                        </div>
                    </div>

                    <span className="hidden md:block bg-[#8B84B8]/30 w-px h-8" aria-hidden="true" />

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center gap-2 bg-[#F5B841]/15 px-3 py-1 border border-[#F5B841]/40 rounded-full font-semibold text-[#F5B841] text-xs">
                            <span className="relative flex size-2">
                                <span className="inline-flex absolute bg-[#F5B841] opacity-75 rounded-full size-full animate-ping" />
                                <span className="inline-flex relative bg-[#F5B841] rounded-full size-2" />
                            </span>
                            <span className="uppercase tracking-wider">Chế độ: Thi thử chuẩn</span>
                        </div>

                        <span className="inline-flex items-center gap-1.5 bg-[#E8E5F5]/10 px-2.5 py-1 rounded-full font-medium text-[#E8E5F5]/80 text-xs">
                            <LuLock className="size-3.5 text-[#8B84B8]" aria-hidden="true" />
                            Không trợ giúp • Khóa nhảy câu
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="hidden sm:flex items-center gap-1.5 font-medium text-[#E8E5F5]/80 text-xs">
                        <LuShieldCheck className="size-4 text-[#F5B841]" aria-hidden="true" />
                        <span>Đã lưu cục bộ • Sẵn sàng đồng bộ</span>
                    </div>

                    <button
                        type="button"
                        onClick={onOpenExitModal}
                        className="inline-flex items-center gap-1.5 bg-transparent hover:bg-[#F5B841] px-3.5 py-2 border border-[#8B84B8]/50 hover:border-[#F5B841] rounded-lg focus-visible:outline-none focus-visible:ring-[#F5B841] focus-visible:ring-2 focus-visible:ring-offset-[#3C3454] focus-visible:ring-offset-2 font-semibold text-[#E8E5F5] hover:text-[#3C3454] text-xs transition-colors duration-200 cursor-pointer"
                    >
                        <LuLogOut className="size-4" aria-hidden="true" />
                        <span>Thoát bài thi</span>
                    </button>
                </div>
            </div>

            {/* ===== Ribbon: tiến trình các bước + đồng hồ ===== */}
            <div className="bg-[#E8E5F5] px-4 sm:px-6 py-3.5 border-[#8B84B8]/30 border-b">
                <div className="flex md:flex-row flex-col justify-between items-center gap-4 mx-auto max-w-6xl">
                    <ol className="flex items-center gap-2 pb-1 md:pb-0 w-full md:w-auto overflow-x-auto text-xs">
                        <li className="flex items-center gap-1.5 font-medium text-[#3C3454]/70 shrink-0">
                            <span className="flex justify-center items-center bg-[#8B84B8] rounded-full size-5 text-white">
                                <LuCheck className="size-3" aria-hidden="true" />
                            </span>
                            <span>1. Hướng dẫn</span>
                        </li>

                        <li aria-hidden="true" className="bg-[#8B84B8]/60 w-4 h-px shrink-0" />

                        <li className="flex items-center gap-1.5 font-medium text-[#3C3454]/70 shrink-0">
                            <span className="flex justify-center items-center bg-[#8B84B8] rounded-full size-5 text-white">
                                <LuCheck className="size-3" aria-hidden="true" />
                            </span>
                            <span>2. Chuẩn bị (45s)</span>
                        </li>

                        <li aria-hidden="true" className="bg-[#8B84B8]/60 w-4 h-px shrink-0" />

                        <li
                            aria-current="step"
                            className="flex items-center gap-2 bg-[#3C3454] shadow-[#3C3454]/25 shadow-md px-3 py-1 rounded-full font-semibold text-[#E8E5F5] shrink-0"
                        >
                            <span className="relative flex size-2">
                                <span
                                    className={`absolute inline-flex size-full rounded-full bg-[#F5B841] opacity-75 ${
                                        isFinished ? '' : 'animate-ping'
                                    }`}
                                />
                                <span className="inline-flex relative bg-[#F5B841] rounded-full size-2" />
                            </span>
                            <span>3. ĐANG GHI ÂM (RECORDING 30s)</span>
                        </li>

                        <li aria-hidden="true" className="bg-[#8B84B8]/60 w-4 h-px shrink-0" />

                        <li className="flex items-center gap-1.5 font-medium text-[#3C3454]/50 shrink-0">
                            <span className="flex justify-center items-center border border-[#8B84B8]/60 rounded-full size-5 text-[11px]">
                                4
                            </span>
                            <span>Chốt bài</span>
                        </li>
                    </ol>

                    <div className="flex justify-between md:justify-end items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col text-left md:text-right">
                            <span className="font-semibold text-[#3C3454] text-[11px] uppercase tracking-wider">
                                Thời gian trả lời còn lại
                            </span>
                            <span className="flex md:justify-end items-center gap-1 text-[#3C3454]/70 text-xs">
                                <LuMic className="size-3.5 text-[#8B84B8]" aria-hidden="true" />
                                Hãy nói to, rõ ràng vào micro
                            </span>
                        </div>

                        <div
                            className={`flex items-center gap-2.5 rounded-xl border px-4 py-1.5 shadow-sm transition-colors ${
                                isFinished ? 'border-[#8B84B8] bg-white' : 'border-[#F5B841] bg-[#3C3454]'
                            }`}
                        >
                            <span
                                className={`size-2.5 rounded-full ${
                                    isFinished ? 'bg-[#8B84B8]' : 'animate-ping bg-[#F5B841]'
                                }`}
                            />
                            <span
                                role="timer"
                                aria-live="off"
                                className={`font-mono text-xl font-bold tabular-nums tracking-tight ${
                                    isFinished ? 'text-[#3C3454]' : 'text-[#F5B841]'
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
