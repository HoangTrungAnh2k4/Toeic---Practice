'use client';

import { LuPlay, LuRotateCcw, LuSquare } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSpeakerTest } from '../_lib/useSpeakerTest';
import { CheckStatus } from '../types';
import { EAR_SIDE_LABEL, EAR_SIDES } from '../utils';
import CheckNotice from './CheckNotice';
import ResultConfirm from './ResultConfirm';

interface SpeakerCheckPanelProps {
    result: CheckStatus;
    onResultChange: (status: CheckStatus) => void;
}

export default function SpeakerCheckPanel({ result, onResultChange }: SpeakerCheckPanelProps) {
    const { playingSide, hasPlayed, isUnsupported, play, stop } = useSpeakerTest();
    const isPlaying = playingSide !== null;
    const PlayIcon = isPlaying ? LuSquare : hasPlayed ? LuRotateCcw : LuPlay;

    return (
        <div className="flex flex-col gap-5">
            <p className="text-subText text-sm leading-relaxed">
                Đeo tai nghe như khi làm bài thật rồi bấm <strong className="text-main">Phát âm thanh thử</strong>.
                Tiếng chuông sẽ vang ở tai trái trước, sau đó chuyển sang tai phải.
            </p>

            <div aria-hidden="true" className="gap-3 grid grid-cols-2">
                {EAR_SIDES.map((side) => {
                    const isActive = playingSide === side;

                    return (
                        <div
                            key={side}
                            className={cn(
                                'flex flex-col items-center gap-2 p-4 rounded-xl transition-colors',
                                isActive ? 'bg-main text-white' : 'bg-sub1/40 text-main',
                            )}
                        >
                            <span
                                className={cn(
                                    'flex justify-center items-center rounded-full size-12 font-bold text-lg transition-transform',
                                    isActive ? 'bg-sub3 text-main motion-safe:scale-110' : 'bg-white text-sub2',
                                )}
                            >
                                {EAR_SIDE_LABEL[side].mark}
                            </span>
                            <span className="font-semibold text-sm">{EAR_SIDE_LABEL[side].label}</span>
                            <span className={cn('text-xs', isActive ? 'text-sub1' : 'text-subText')}>
                                {isActive ? 'Đang phát…' : 'Chờ phát'}
                            </span>
                        </div>
                    );
                })}
            </div>

            <p role="status" className="sr-only">
                {playingSide ? `Đang phát ở ${EAR_SIDE_LABEL[playingSide].label.toLowerCase()}` : ''}
            </p>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Button type="button" variant="primary" size="md" onClick={isPlaying ? stop : play} className="gap-2">
                    <PlayIcon className="size-4" aria-hidden="true" />
                    {isPlaying ? 'Dừng phát' : hasPlayed ? 'Phát lại' : 'Phát âm thanh thử'}
                </Button>
                <span className="text-subText text-xs">Mẹo: đặt âm lượng hệ thống khoảng 50–70%.</span>
            </div>

            {isUnsupported && (
                <CheckNotice tone="error" title="Trình duyệt chưa hỗ trợ phát âm thanh thử">
                    Hãy dùng phiên bản mới của Chrome, Edge, Firefox hoặc Safari.
                </CheckNotice>
            )}

            {(hasPlayed || result !== 'pending') && (
                <ResultConfirm
                    question="Bạn có nghe rõ tiếng chuông ở cả hai bên tai không?"
                    passLabel="Nghe rõ cả hai bên"
                    failLabel="Không nghe rõ"
                    value={result}
                    onChange={onResultChange}
                />
            )}

            {result === 'failed' && (
                <CheckNotice tone="warning" title="Chưa nghe rõ âm thanh?">
                    Thử các gợi ý trong mục “Gặp sự cố?”, sau đó bấm Phát lại để kiểm tra lần nữa.
                </CheckNotice>
            )}
        </div>
    );
}
