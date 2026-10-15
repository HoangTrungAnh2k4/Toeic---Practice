import { LuBrain } from 'react-icons/lu';
import { HistoryAttempt } from '../../types';

interface ReviewScoringStateProps {
    attempt: HistoryAttempt;
}

export default function ReviewScoringState({ attempt }: ReviewScoringStateProps) {
    const progress = attempt.scoreInfo.scoringProgress ?? 0;

    return (
        <section
            aria-labelledby="scoring-title"
            aria-live="polite"
            className="flex flex-col gap-4 bg-sub3/10 shadow-sm p-5 sm:p-6 border border-sub3/50 rounded-xl"
        >
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                    <LuBrain className="size-5 animate-pulse" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                    <h2 id="scoring-title" className="font-bold text-main text-lg tracking-tight">
                        AI đang chấm bài ({progress}%)
                    </h2>
                    <p className="font-medium text-subText text-sm">
                        Dự kiến hoàn tất: {attempt.scoreInfo.estimatedTimeRemaining}. Điểm, nhận xét và lỗi sẽ hiển thị
                        tại đây khi chấm xong; bài này chưa được tính vào sổ lỗi.
                    </p>
                </div>
            </div>
            <div
                role="progressbar"
                aria-label="Tiến độ chấm điểm"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
                className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
            >
                <div className="bg-sub3 rounded-full h-full transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
        </section>
    );
}
