'use client';

import { useRef, useState } from 'react';
import { LuMic, LuPlay, LuRotateCcw, LuSquare } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useTestRecorder } from '../_lib/useTestRecorder';
import { CheckStatus, MicStatus } from '../types';
import { RECORD_SECONDS, RECORDER_ERROR_COPY, SPEAKING_SAMPLE } from '../utils';
import CheckNotice from './CheckNotice';
import MicrophoneAccessNotice from './MicrophoneAccessNotice';
import RecordingConsole from './RecordingConsole';
import ResultConfirm from './ResultConfirm';

interface RecordingCheckPanelProps {
    micStatus: MicStatus;
    hasMicAccess: boolean;
    stream: MediaStream | null;
    analyser: AnalyserNode | null;
    deviceLabel: string;
    result: CheckStatus;
    onResultChange: (status: CheckStatus) => void;
    onRequestAccess: () => void;
    onChangeMicrophone: () => void;
}

export default function RecordingCheckPanel({
    micStatus,
    hasMicAccess,
    stream,
    analyser,
    deviceLabel,
    result,
    onResultChange,
    onRequestAccess,
    onChangeMicrophone,
}: RecordingCheckPanelProps) {
    const recorder = useTestRecorder(stream, analyser);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [playbackMs, setPlaybackMs] = useState(0);
    const [hasListened, setHasListened] = useState(false);

    const isRecording = recorder.status === 'recording';
    const hasRecording = recorder.status === 'recorded' && recorder.audioUrl !== null;

    const handleRecord = () => {
        audioRef.current?.pause();
        setPlaybackMs(0);
        setHasListened(false);
        onResultChange('pending');
        recorder.start();
    };

    const togglePlayback = () => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = 0;
        if (!audio.paused) {
            audio.pause();
            return;
        }
        setHasListened(true);
        audio.play().catch(() => setIsPlaying(false));
    };

    if (micStatus !== 'active' || !stream) {
        return (
            <div className="flex flex-col gap-4">
                <p className="text-subText text-sm leading-relaxed">
                    Bước này dùng micro bạn đã chọn ở bước trước. Hãy bật micro để bắt đầu ghi âm thử.
                </p>
                <MicrophoneAccessNotice status={micStatus} hasAccess={hasMicAccess} onRequestAccess={onRequestAccess} />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-5">
            <CheckNotice tone="info" title={`Bấm ghi âm rồi đọc to câu sau trong ${RECORD_SECONDS} giây`}>
                <span lang="en" className="block mt-1 font-semibold text-main text-sm italic">
                    “{SPEAKING_SAMPLE}”
                </span>
            </CheckNotice>

            <RecordingConsole
                status={recorder.status}
                isPlaying={isPlaying}
                elapsedMs={recorder.elapsedMs}
                playbackMs={playbackMs}
                waveform={recorder.waveform}
                deviceLabel={deviceLabel}
            />

            <div className="flex flex-wrap gap-3">
                {hasRecording && (
                    <Button type="button" variant="primary" size="md" onClick={togglePlayback} className="gap-2">
                        {isPlaying ? (
                            <LuSquare className="size-4" aria-hidden="true" />
                        ) : (
                            <LuPlay className="size-4" aria-hidden="true" />
                        )}
                        {isPlaying ? 'Dừng phát' : 'Nghe lại'}
                    </Button>
                )}
                {isRecording ? (
                    <Button type="button" variant="third" size="md" onClick={recorder.stop} className="gap-2 bg-white">
                        <LuSquare className="size-4" aria-hidden="true" />
                        Dừng ghi
                    </Button>
                ) : (
                    <Button
                        type="button"
                        variant={hasRecording ? 'third' : 'primary'}
                        size="md"
                        onClick={handleRecord}
                        className={cn('gap-2', hasRecording && 'bg-white')}
                    >
                        {hasRecording ? (
                            <LuRotateCcw className="size-4" aria-hidden="true" />
                        ) : (
                            <LuMic className="size-4" aria-hidden="true" />
                        )}
                        {hasRecording ? 'Ghi âm lại' : `Ghi âm thử ${RECORD_SECONDS} giây`}
                    </Button>
                )}
            </div>

            {recorder.audioUrl && (
                <audio
                    ref={audioRef}
                    src={recorder.audioUrl}
                    preload="auto"
                    className="hidden"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setPlaybackMs(0)}
                    onTimeUpdate={(event) => setPlaybackMs(event.currentTarget.currentTime * 1000)}
                />
            )}

            {recorder.status === 'error' && (
                <div role="alert">
                    <CheckNotice tone="error" title={RECORDER_ERROR_COPY.title}>
                        {RECORDER_ERROR_COPY.description}
                    </CheckNotice>
                </div>
            )}

            {hasRecording && hasListened && (
                <ResultConfirm
                    question="Giọng của bạn nghe có rõ ràng, không bị rè hay quá nhỏ không?"
                    passLabel="Rõ ràng"
                    failLabel="Chưa rõ"
                    value={result}
                    onChange={onResultChange}
                />
            )}

            {result === 'failed' && (
                <CheckNotice
                    tone="warning"
                    title="Bản ghi chưa rõ?"
                    action={
                        <Button
                            type="button"
                            variant="third"
                            size="sm"
                            onClick={onChangeMicrophone}
                            className="gap-2 bg-white"
                        >
                            <LuMic className="size-4" aria-hidden="true" />
                            Đổi micro
                        </Button>
                    }
                >
                    Điều chỉnh khoảng cách tới micro hoặc chọn thiết bị khác, sau đó ghi âm lại.
                </CheckNotice>
            )}
        </div>
    );
}
