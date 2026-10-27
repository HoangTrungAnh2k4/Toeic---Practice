import { LuAudioLines } from 'react-icons/lu';
import type { Criterion } from '@/lib/domain/types';
import { HistoryRow, ReviewQuestion } from '../../types';
import { CRITERION_LABEL } from '../../utils';

interface ReviewScoreSummaryProps {
    row: HistoryRow;
    questions: ReviewQuestion[];
}

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

/** Thống kê nhận xét trong bài; điểm quy đổi nằm ở `ReviewHeader`. */
export default function ReviewScoreSummary({ row, questions }: ReviewScoreSummaryProps) {
    const annotations = questions.flatMap((q) => q.annotations);
    const perfectCount = questions.filter(
        ({ response }) => response?.score != null && response.score === response.max_score,
    ).length;

    const byCriterion = new Map<Criterion, number>();
    for (const { criterion } of annotations) byCriterion.set(criterion, (byCriterion.get(criterion) ?? 0) + 1);
    const criteria = [...byCriterion.entries()].sort((a, b) => b[1] - a[1]);
    const maxCount = criteria[0]?.[1] ?? 0;

    const stats = [
        { label: 'Lỗi ghi nhận', value: annotations.length },
        { label: 'Câu đạt tối đa', value: `${perfectCount}/${questions.length}` },
    ];

    return (
        <section
            aria-label="Nhận xét trong bài"
            className="flex flex-col gap-5 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <div className="gap-5 grid grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)]">
                <dl className="gap-3 grid grid-cols-2 md:grid-cols-1">
                    {stats.map(({ label, value }) => (
                        <div key={label} className="flex flex-col gap-1 bg-canvas p-4 rounded-lg">
                            <dt className="font-medium text-subText text-xs">{label}</dt>
                            <dd className="font-bold tabular-nums text-main text-2xl leading-none">{value}</dd>
                        </div>
                    ))}
                </dl>

                <div className="flex flex-col gap-3 min-w-0">
                    <span className={LABEL_CLASS}>Lỗi theo tiêu chí</span>
                    {criteria.length === 0 ? (
                        <p className="font-medium text-subText text-sm">Không có lỗi nào được ghi nhận trong bài này.</p>
                    ) : (
                        <ul className="flex flex-col gap-2.5">
                            {criteria.map(([criterion, count]) => (
                                <li
                                    key={criterion}
                                    className="items-center gap-3 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_2rem] font-medium text-main text-sm"
                                >
                                    <span className="truncate">{CRITERION_LABEL[criterion]}</span>
                                    <progress
                                        value={count}
                                        max={maxCount}
                                        aria-hidden="true"
                                        className="[&::-webkit-progress-bar]:bg-sub1 [&::-moz-progress-bar]:bg-sub2 [&::-webkit-progress-value]:bg-sub2 bg-sub1 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full w-full h-2 overflow-hidden appearance-none"
                                    />
                                    <span className="font-semibold tabular-nums text-right">{count}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {row.exam.skill === 'speaking' && (
                <p className="flex items-start gap-1.5 pt-4 border-sub2/20 border-t font-medium text-subText text-xs">
                    <LuAudioLines className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                    Transcript do AI nhận dạng từ bản ghi âm, có thể khác đôi chút so với lời bạn nói.
                </p>
            )}
        </section>
    );
}
