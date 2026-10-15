import { LuBrain } from 'react-icons/lu';
import { HistoryRow } from '../../types';

interface ReviewScoringStateProps {
    row: HistoryRow;
}

export default function ReviewScoringState({ row }: ReviewScoringStateProps) {
    const { scoring_error: scoringError } = row.attempt;

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
                        Bài đã nộp, đang chờ AI chấm
                    </h2>
                    <p className="font-medium text-subText text-sm">
                        Điểm, nhận xét và lỗi sẽ hiển thị tại đây khi chấm xong; bài này chưa được tính vào sổ lỗi.
                    </p>
                    {scoringError && <p className="font-semibold text-main text-sm">Lỗi khi chấm: {scoringError}</p>}
                </div>
            </div>
        </section>
    );
}
