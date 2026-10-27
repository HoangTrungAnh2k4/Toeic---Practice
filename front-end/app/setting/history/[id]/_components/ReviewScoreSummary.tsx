import { LuAudioLines } from 'react-icons/lu';
import { getScoreLevel } from '@/lib/domain/score-levels';
import type { Criterion } from '@/lib/domain/types';
import { HistoryRow, ReviewQuestion } from '../../types';
import { CRITERION_LABEL } from '../../utils';

interface ReviewScoreSummaryProps {
    row: HistoryRow;
    questions: ReviewQuestion[];
    /** Tổng 0–200 cả bài Writing (lượt chấm gần nhất của mỗi Part). */
}

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

export default function ReviewScoreSummary({ row, questions }: ReviewScoreSummaryProps) {
    const { attempt, exam, scoreDelta } = row;
    const { score, feedback_summary: feedbackSummary, scoring_error: scoringError } = attempt;
    const annotations = questions.flatMap((q) => q.annotations);
    const perfectCount = questions.filter(
        ({ response }) => response?.score != null && response.score === response.max_score,
    ).length;

    const byCriterion = new Map<Criterion, number>();
    for (const { criterion } of annotations) byCriterion.set(criterion, (byCriterion.get(criterion) ?? 0) + 1);

    const stats = [
        { label: 'Lỗi ghi nhận', value: annotations.length },
        { label: 'Câu đạt tối đa', value: `${perfectCount}/${questions.length}` },
    ];

    return (
        <section aria-label="Tổng quan kết quả" className="gap-4 grid grid-cols-1 lg:grid-cols-2">
            {/* Score */}
            <div className="flex flex-col gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sub1 text-xs uppercase tracking-wider">
                        {attempt.part_template_id === null ? 'Điểm quy đổi' : 'Điểm quy đổi của Part'}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-bold tabular-nums text-sub1 text-4xl tracking-tight">{score ?? '—'}</span>
                        <span className="font-semibold text-sub1/80 text-sm">/ 200</span>
                        {score !== null && (
                            <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[0.6875rem] text-main">
                                Level {getScoreLevel(exam.skill, score)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-1 bg-sub1/10 px-3 py-2 rounded-lg text-sub1 text-xs">
                    {scoringError && <strong className="font-semibold text-sub1">{scoringError}</strong>}
                    {feedbackSummary && <span>{feedbackSummary}</span>}
                    {scoreDelta !== null && (
                        <strong className="font-semibold text-sub3">
                            {scoreDelta >= 0 ? '+' : ''}
                            {scoreDelta} điểm so với lượt trước
                        </strong>
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="flex flex-col gap-4 bg-card shadow-sm p-5 border border-sub2/30 rounded-xl">
                <span className={LABEL_CLASS}>Nhận xét trong bài</span>
                <dl className="gap-3 grid grid-cols-2">
                    {stats.map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-0.5 bg-sub1/50 p-3 rounded-lg">
                            <dt className="font-medium text-subText text-xs">{label}</dt>
                            <dd className="font-bold tabular-nums text-main text-xl">{value}</dd>
                        </div>
                    ))}
                </dl>
                {byCriterion.size > 0 && (
                    <ul className="flex flex-wrap gap-1.5" aria-label="Lỗi theo tiêu chí">
                        {[...byCriterion.entries()].map(([criterion, count]) => (
                            <li key={criterion} className="bg-sub1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider">
                                {CRITERION_LABEL[criterion]} · {count}
                            </li>
                        ))}
                    </ul>
                )}
                {exam.skill === 'speaking' && (
                    <p className="flex items-start gap-1.5 mt-auto pt-3 border-sub2/20 border-t font-medium text-subText text-xs">
                        <LuAudioLines className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                        Transcript do AI nhận dạng từ bản ghi âm, có thể khác đôi chút so với lời bạn nói.
                    </p>
                )}
            </div>
        </section>
    );
}
