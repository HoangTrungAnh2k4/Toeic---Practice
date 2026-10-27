import { useState } from 'react';
import { LuBrain, LuRotateCw } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { canRescore } from '@/lib/scoring/scale';
import { HistoryRow } from '../../types';

interface ReviewScoringStateProps {
    row: HistoryRow;
    /** Chấm lại bài chưa có điểm (Writing); bỏ trống thì không có nút. */
    onRescore?: () => Promise<void>;
}

export default function ReviewScoringState({ row, onRescore }: ReviewScoringStateProps) {
    const { scoring_error: scoringError } = row.attempt;
    const [isRescoring, setIsRescoring] = useState(false);
    // Quá hạn chờ hoặc chấm lỗi thì không còn "đang chấm" nữa
    const stalled = canRescore(row.attempt);
    const showRescore = onRescore && (isRescoring || stalled);

    const handleRescore = async () => {
        setIsRescoring(true);
        try {
            await onRescore?.();
        } finally {
            setIsRescoring(false);
        }
    };

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
                        {stalled ? 'Bài đã nộp nhưng chưa có điểm' : 'Đang chấm bài, vui lòng chờ'}
                    </h2>
                    <p className="font-medium text-subText text-sm">
                        Điểm, nhận xét và lỗi sẽ hiển thị tại đây khi chấm xong.
                    </p>
                    {scoringError && <p className="font-semibold text-main text-sm">Lỗi khi chấm: {scoringError}</p>}
                </div>
            </div>
            {showRescore && (
                <Button
                    type="button"
                    variant="primary"
                    size="sm"
                    className="gap-2 self-start"
                    disabled={isRescoring}
                    onClick={() => void handleRescore()}
                >
                    <LuRotateCw className={isRescoring ? 'size-4 animate-spin' : 'size-4'} aria-hidden="true" />
                    {isRescoring ? 'Đang chấm lại...' : 'Chấm lại'}
                </Button>
            )}
        </section>
    );
}
