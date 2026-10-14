import { LuMic } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { RecorderStatus } from '../types';
import { RECORD_MS, RECORD_SECONDS, toBarHeight, WAVEFORM_BARS } from '../utils';

const STATUS_LABEL: Record<RecorderStatus, string> = {
    idle: 'Sẵn sàng ghi âm',
    recording: 'Đang ghi âm',
    recorded: 'Đã ghi xong',
    error: 'Không thể ghi âm',
};

interface RecordingConsoleProps {
    status: RecorderStatus;
    isPlaying: boolean;
    /** Thời lượng đã ghi (ms). */
    elapsedMs: number;
    /** Vị trí đang phát lại (ms). */
    playbackMs: number;
    /** Mức dB lấy mẫu trong lúc ghi, mỗi phần tử là một cột sóng âm. */
    waveform: number[];
    deviceLabel: string;
}

/** Bảng ghi âm tối màu, đồng bộ với giao diện ghi âm trong phòng thi Speaking. */
export default function RecordingConsole({
    status,
    isPlaying,
    elapsedMs,
    playbackMs,
    waveform,
    deviceLabel,
}: RecordingConsoleProps) {
    const isRecording = status === 'recording';
    const isRecorded = status === 'recorded';
    const playedBars = isPlaying && elapsedMs > 0 ? Math.round((playbackMs / elapsedMs) * waveform.length) : 0;

    let counter = RECORD_SECONDS;
    let counterLabel = 'thời lượng';
    if (isRecording) {
        counter = Math.max(0, Math.ceil((RECORD_MS - elapsedMs) / 1000));
        counterLabel = 'còn lại';
    } else if (isRecorded && isPlaying) {
        counter = Math.max(0, Math.ceil((elapsedMs - playbackMs) / 1000));
        counterLabel = 'còn lại';
    } else if (isRecorded) {
        counter = Math.max(1, Math.round(elapsedMs / 1000));
        counterLabel = 'đã ghi';
    }

    return (
        <section aria-label="Bảng ghi âm thử" className="flex flex-col gap-5 bg-main p-5 rounded-xl text-sub1">
            <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                    <span role="status" className="flex items-center gap-2 font-medium text-sm">
                        {isRecording ? (
                            <span className="relative flex size-2.5" aria-hidden="true">
                                <span className="inline-flex absolute bg-sub3 opacity-60 rounded-full size-full motion-safe:animate-ping" />
                                <span className="inline-flex relative bg-sub3 rounded-full size-2.5" />
                            </span>
                        ) : (
                            <LuMic className="size-4 text-sub3" aria-hidden="true" />
                        )}
                        {isRecorded && isPlaying ? 'Đang phát lại' : STATUS_LABEL[status]}
                    </span>
                    <span className="text-sub2 text-xs truncate">{deviceLabel}</span>
                </div>

                <div className="text-right shrink-0">
                    <p className="font-semibold tabular-nums text-sub3 text-3xl leading-none">{counter}s</p>
                    <p className="mt-1 text-sub2 text-xs">{counterLabel}</p>
                </div>
            </div>

            {/* Sóng âm thật của đoạn thu: cột đã ghi/đã phát tô vàng */}
            <div aria-hidden="true">
                <div className="flex items-center gap-1 w-full h-16">
                    {Array.from({ length: WAVEFORM_BARS }, (_, index) => {
                        const level = waveform[index];
                        const isCaptured = level !== undefined;

                        return (
                            <span
                                key={index}
                                className={cn(
                                    'flex-1 rounded-full transition-colors duration-200',
                                    !isCaptured && 'bg-sub2/30',
                                    isCaptured && (isRecording || index < playedBars ? 'bg-sub3' : 'bg-sub2'),
                                )}
                                style={{ height: `${isCaptured ? toBarHeight(level) : 8}%` }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 tabular-nums text-sub2 text-xs">
                    <span>0s</span>
                    <span>{RECORD_SECONDS}s</span>
                </div>
            </div>
        </section>
    );
}
