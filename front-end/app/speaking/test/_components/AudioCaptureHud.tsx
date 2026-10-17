'use client';

import { LuMic, LuSkipForward } from 'react-icons/lu';
import { useInputLevel } from '@/app/setting/device-check/_lib/useInputLevel';
import { getLevelZone, LEVEL_ZONE_LABEL, METER_MIN_DB } from '@/app/setting/device-check/utils';
import { cn } from '@/lib/utils';
import type { SpeakingPhase } from '../types';

interface AudioCaptureHudProps {
    phase: SpeakingPhase;
    secondsRemaining: number;
    /** Độ dài giai đoạn hiện tại (chuẩn bị hoặc trả lời). */
    totalSeconds: number;
    analyser: AnalyserNode | null;
    isGuided: boolean;
    /** Bỏ qua chuẩn bị, vào nói ngay (chỉ chế độ có hướng dẫn). */
    onSkipPrep: () => void;
}

const PHASE_LABEL: Record<SpeakingPhase, string> = {
    prep: 'Đang chuẩn bị, chưa ghi âm',
    speak: 'Đang ghi âm',
    done: 'Đã chốt bài nói',
};

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

export default function AudioCaptureHud({
    phase,
    secondsRemaining,
    totalSeconds,
    analyser,
    isGuided,
    onSkipPrep,
}: AudioCaptureHudProps) {
    const percentage = Math.min(100, Math.round(((totalSeconds - secondsRemaining) / totalSeconds) * 100));
    const playedBars = Math.round((percentage / 100) * WAVE_BARS.length);
    const isRecording = phase === 'speak';
    const levelDb = useInputLevel(analyser);
    const meterActive = Math.round(((levelDb - METER_MIN_DB) / -METER_MIN_DB) * METER_SEGMENTS);

    return (
        <div className="flex flex-col gap-4 bg-white p-4 border border-sub1 rounded-2xl h-full">
            {/* Recording console: waveform đóng vai trò timeline */}
            <section
                aria-label={phase === 'prep' ? 'Thời gian chuẩn bị' : 'Bản ghi âm đang thực hiện'}
                className="flex flex-col gap-5 bg-main p-5 rounded-xl text-sub1"
            >
                <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-2 font-medium text-sm">
                            <span className="relative flex size-2.5">
                                {isRecording && (
                                    <span className="inline-flex absolute bg-sub3 opacity-60 rounded-full size-full motion-safe:animate-ping" />
                                )}
                                <span
                                    className={cn('inline-flex relative rounded-full size-2.5', isRecording ? 'bg-sub3' : 'bg-sub2')}
                                />
                            </span>
                            {PHASE_LABEL[phase]}
                        </span>
                        <span className="flex items-center gap-1.5 text-sub2 text-xs">
                            <LuMic className="size-3.5" aria-hidden="true" />
                            Micro đang hoạt động
                        </span>
                    </div>

                    <div className="text-right">
                        <p className="font-semibold tabular-nums text-sub3 text-3xl leading-none">
                            {secondsRemaining}s
                        </p>
                        <p className="mt-1 text-sub2 text-xs">còn lại</p>
                    </div>
                </div>

                {/* Waveform timeline */}
                <div>
                    <div
                        role="progressbar"
                        aria-label={phase === 'prep' ? 'Tiến độ thời gian chuẩn bị' : 'Tiến độ bài nói'}
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
                    <span className="font-semibold tabular-nums">
                        {levelDb} dB, {LEVEL_ZONE_LABEL[getLevelZone(levelDb)].toLowerCase()}
                    </span>
                </div>
                <div className="flex gap-1" aria-hidden="true">
                    {Array.from({ length: METER_SEGMENTS }, (_, idx) => (
                        <span
                            key={idx}
                            className={cn(
                                'flex-1 rounded-sm h-2',
                                idx < meterActive ? 'bg-main' : 'bg-sub1',
                                idx >= METER_SEGMENTS - 2 && (idx < meterActive ? 'bg-sub3' : 'bg-sub3/40'),
                            )}
                        />
                    ))}
                </div>
                <p className="text-main/70 text-xs leading-relaxed">
                    Giữ tay xa micro để tránh tiếng ồn lẫn vào bài nói.
                </p>
            </div>

            {/* Cách chốt bài nói */}
            <div className="flex flex-col gap-2.5 bg-sub1/60 mt-auto p-3 border-sub3 border-l-4 rounded-r-lg">
                {phase === 'prep' ? (
                    <p className="text-main/80 text-xs leading-relaxed">
                        <span className="font-semibold text-main">Hết giờ chuẩn bị là bắt đầu ghi âm.</span> Đọc đề và
                        sắp xếp ý trong lúc chờ.
                    </p>
                ) : (
                    <p className="text-main/80 text-xs leading-relaxed">
                        <span className="font-semibold text-main">Hết giờ là dừng ghi âm.</span>{' '}
                        {isGuided ? 'Bấm Tiếp tục bất cứ lúc nào để chốt bài nói' : 'Bấm Tiếp tục để chốt bài nói'} và
                        sang câu sau, bạn không thể thu âm lại.
                    </p>
                )}
                {phase === 'prep' && isGuided && (
                    <button
                        type="button"
                        onClick={onSkipPrep}
                        className="inline-flex items-center self-start gap-1.5 bg-main hover:bg-sub3 px-3 py-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 focus-visible:ring-offset-2 font-semibold text-sub1 hover:text-main text-xs transition-colors duration-200 cursor-pointer"
                    >
                        <LuSkipForward className="size-3.5" aria-hidden="true" />
                        Bỏ qua chuẩn bị, nói ngay
                    </button>
                )}
            </div>
        </div>
    );
}
