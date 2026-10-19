import Link from 'next/link';
import { LuAudioLines, LuChevronRight, LuCircleCheck, LuEye } from 'react-icons/lu';
import { MistakeStatusBadge } from '@/components/mistakes/mistake-badges';
import { Criterion, MistakeItem } from '@/app/mistakes/types';
import { CRITERION_LABEL, getMistakeHref } from '@/app/mistakes/utils';
import { getScoreLevel } from '@/lib/domain/score-levels';
import { HistoryRow, ReviewQuestion } from '../../types';

interface ReviewScoreSummaryProps {
    row: HistoryRow;
    questions: ReviewQuestion[];
    mistakeIndex: Record<string, MistakeItem>;
    /** Tổng 0–200 cả bài Writing (lượt chấm gần nhất của mỗi Part). */
    writingTotal: number | null;
}

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

export default function ReviewScoreSummary({ row, questions, mistakeIndex, writingTotal }: ReviewScoreSummaryProps) {
    const { attempt, exam, scoreDelta } = row;
    const { score, feedback_summary: feedbackSummary } = attempt;
    const annotations = questions.flatMap((q) => q.annotations);
    const recurringIds = [
        ...new Set(annotations.flatMap((a) => (a.mistake_pattern_id ? [a.mistake_pattern_id] : []))),
    ];
    const recurring = recurringIds.map((id) => mistakeIndex[id]).filter(Boolean);
    const oneOffCount = annotations.filter((a) => !a.mistake_pattern_id).length;
    const perfectCount = questions.filter(
        ({ response }) => response?.score != null && response.score === response.max_score,
    ).length;

    const byCriterion = new Map<Criterion, number>();
    for (const { criterion } of annotations) byCriterion.set(criterion, (byCriterion.get(criterion) ?? 0) + 1);

    const stats = [
        { label: 'Lỗi ghi nhận', value: annotations.length },
        { label: 'Thuộc sổ lỗi', value: recurring.length },
        { label: 'Lỗi đơn lẻ', value: oneOffCount },
        { label: 'Câu đạt tối đa', value: `${perfectCount}/${questions.length}` },
    ];

    return (
        <section aria-label="Tổng quan kết quả" className="gap-4 grid grid-cols-1 lg:grid-cols-3">
            {/* Score */}
            <div className="flex flex-col justify-between gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-sub1 text-xs uppercase tracking-wider">
                        {attempt.part_template_id === null ? 'Điểm quy đổi' : 'Điểm quy đổi của Part'}
                    </span>
                    <div className="flex flex-wrap items-baseline gap-2">
                        <span className="font-bold text-sub1 text-4xl tabular-nums tracking-tight">{score ?? '—'}</span>
                        <span className="font-semibold text-sub1/80 text-sm">/ 200</span>
                        {score !== null && (
                            <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[0.6875rem] text-main">
                                Level {getScoreLevel(exam.skill, score)}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex flex-col gap-1 bg-sub1/10 px-3 py-2 rounded-lg text-sub1 text-xs">
                    {writingTotal !== null && (
                        <strong className="font-semibold text-sub1">
                            Tổng cả bài Writing: {writingTotal}/200 · Level {getScoreLevel('writing', writingTotal)}{' '}
                            <span className="font-normal text-sub1/80">(lượt chấm gần nhất của mỗi Part)</span>
                        </strong>
                    )}
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
                            <dd className="font-bold text-main text-xl tabular-nums">{value}</dd>
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
            </div>

            {/* Recurring mistakes */}
            <div className="flex flex-col gap-3 bg-card shadow-sm p-5 border border-sub2/30 rounded-xl">
                <span className={LABEL_CLASS}>Lỗi lặp lại trong bài này</span>
                {recurring.length === 0 ? (
                    <p className="flex items-center gap-2 font-medium text-main text-sm">
                        <LuCircleCheck className="size-4 shrink-0" aria-hidden="true" />
                        Không mắc lỗi nào trong sổ lỗi.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-2">
                        {recurring.map((mistake) => (
                            <li key={mistake.id}>
                                <Link
                                    href={getMistakeHref(mistake.id)}
                                    className="flex items-center gap-2 hover:bg-sub1/50 p-2.5 border border-sub2/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                                >
                                    <div className="flex flex-col flex-1 gap-1 min-w-0">
                                        <span className="font-semibold text-main text-sm">{mistake.title}</span>
                                        <MistakeStatusBadge status={mistake.status} className="w-fit" />
                                    </div>
                                    <LuChevronRight className="size-4 text-subText shrink-0" aria-hidden="true" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <div className="flex flex-col gap-1.5 mt-auto pt-3 border-sub2/20 border-t font-medium text-subText text-xs">
                    {attempt.sample_viewed && (
                        <p className="flex items-start gap-1.5">
                            <LuEye className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                            Bài có xem bài mẫu: lỗi vẫn được ghi nhận nhưng không tính vào tiến độ khắc phục.
                        </p>
                    )}
                    {exam.skill === 'speaking' && (
                        <p className="flex items-start gap-1.5">
                            <LuAudioLines className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                            Transcript do AI nhận dạng từ bản ghi âm, có thể khác đôi chút so với lời bạn nói.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}
