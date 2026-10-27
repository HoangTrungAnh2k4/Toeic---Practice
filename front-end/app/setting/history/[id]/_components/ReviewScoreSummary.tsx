import { LuAudioLines, LuTrendingDown, LuTrendingUp, LuTriangleAlert } from 'react-icons/lu';
import { getScoreLevel, SCORE_LEVELS } from '@/lib/domain/score-levels';
import type { Criterion } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { HistoryRow, ReviewQuestion } from '../../types';
import { CRITERION_LABEL } from '../../utils';

interface ReviewScoreSummaryProps {
    row: HistoryRow;
    questions: ReviewQuestion[];
}

const MAX_SCORE = 200;
const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';
// Class tĩnh để Tailwind sinh được: Speaking 8 Level, Writing 9 Level
const LEVEL_COLS: Record<number, string> = { 8: 'grid-cols-8', 9: 'grid-cols-9' };

export default function ReviewScoreSummary({ row, questions }: ReviewScoreSummaryProps) {
    const { attempt, exam, scoreDelta } = row;
    const { score, scoring_error: scoringError } = attempt;
    const levels = SCORE_LEVELS.filter((level) => level.skill === exam.skill);
    const currentLevel = score === null ? null : getScoreLevel(exam.skill, score);
    const DeltaIcon = scoreDelta !== null && scoreDelta < 0 ? LuTrendingDown : LuTrendingUp;

    const annotations = questions.flatMap((q) => q.annotations);
    const perfectCount = questions.filter(
        ({ response }) => response?.score != null && response.score === response.max_score,
    ).length;
    const byCriterion = new Map<Criterion, number>();
    for (const { criterion } of annotations) byCriterion.set(criterion, (byCriterion.get(criterion) ?? 0) + 1);
    const criteria = [...byCriterion.entries()].sort((a, b) => b[1] - a[1]);

    return (
        <section
            aria-label="Tổng quan kết quả"
            className="flex sm:flex-row flex-col items-center sm:items-stretch gap-6 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            {/* Gauge: pathLength = thang điểm nên dasharray dùng thẳng điểm số */}
            <div className="relative size-36 shrink-0">
                <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="18" cy="18" r="15.5" fill="none" strokeWidth="3" className="stroke-sub1" />
                    {score !== null && score > 0 && (
                        <circle
                            cx="18"
                            cy="18"
                            r="15.5"
                            fill="none"
                            strokeWidth="3"
                            strokeLinecap="round"
                            pathLength={MAX_SCORE}
                            strokeDasharray={`${score} ${MAX_SCORE}`}
                            className="stroke-main"
                        />
                    )}
                </svg>
                <p className="absolute inset-0 flex flex-col justify-center items-center">
                    <span className="font-bold tabular-nums text-main text-4xl leading-none tracking-tight">
                        {score ?? '—'}
                    </span>
                    <span className="mt-1 font-semibold text-subText text-xs">/ {MAX_SCORE} điểm</span>
                </p>
            </div>

            <div className="flex flex-col flex-1 gap-4 w-full min-w-0">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className={LABEL_CLASS}>
                        {attempt.part_template_id === null ? 'Điểm quy đổi' : 'Điểm quy đổi của Part'}
                    </span>
                    {currentLevel !== null && (
                        <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[0.6875rem] text-main tracking-wider">
                            Level {currentLevel} / {levels.length}
                        </span>
                    )}
                    {scoreDelta !== null && (
                        <span className="flex items-center gap-1 sm:ml-auto font-semibold text-main text-xs">
                            <DeltaIcon className="size-4" aria-hidden="true" />
                            {scoreDelta >= 0 ? '+' : ''}
                            {scoreDelta} so với lượt trước
                        </span>
                    )}
                </div>

                {/* Thang Level: mỗi ô một Level, nhãn là điểm tối thiểu; Level hiện tại đã đọc ở badge nên ẩn với screen reader */}
                {currentLevel !== null && (
                    <ol aria-hidden="true" className={cn('gap-1 grid', LEVEL_COLS[levels.length])}>
                        {levels.map(({ level, min_score: minScore }) => (
                            <li key={level} className="flex flex-col gap-1">
                                <span
                                    className={cn(
                                        'rounded-full h-2',
                                        level < currentLevel && 'bg-main',
                                        level === currentLevel && 'bg-sub3 ring-2 ring-main',
                                        level > currentLevel && 'bg-sub1',
                                    )}
                                />
                                <span
                                    className={cn(
                                        'tabular-nums text-[0.6875rem]',
                                        level === currentLevel ? 'font-bold text-main' : 'font-medium text-subText',
                                    )}
                                >
                                    {minScore}
                                </span>
                            </li>
                        ))}
                    </ol>
                )}

                {/* feedback_summary chỉ là nhận xét từng câu ghép lại, đã hiện ở card mỗi câu nên không lặp ở đây */}
                {scoringError && (
                    <p role="alert" className="flex items-start gap-1.5 font-semibold text-main text-xs">
                        <LuTriangleAlert className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                        {scoringError}
                    </p>
                )}

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-auto pt-4 border-sub2/20 border-t">
                    <dl className="flex items-center gap-4 font-medium text-subText text-sm">
                        <div className="flex items-baseline gap-1.5">
                            <dt>lỗi ghi nhận</dt>
                            <dd className="order-first font-bold tabular-nums text-main text-base">{annotations.length}</dd>
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <dt>câu đạt tối đa</dt>
                            <dd className="order-first font-bold tabular-nums text-main text-base">
                                {perfectCount}/{questions.length}
                            </dd>
                        </div>
                    </dl>
                    {criteria.length > 0 && (
                        <ul className="flex flex-wrap gap-1.5" aria-label="Lỗi theo tiêu chí">
                            {criteria.map(([criterion, count]) => (
                                <li
                                    key={criterion}
                                    className="bg-sub1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-main tracking-wider"
                                >
                                    {CRITERION_LABEL[criterion]} · {count}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {exam.skill === 'speaking' && (
                    <p className="flex items-start gap-1.5 font-medium text-subText text-xs">
                        <LuAudioLines className="mt-px size-3.5 shrink-0" aria-hidden="true" />
                        Transcript do AI nhận dạng từ bản ghi âm, có thể khác đôi chút so với lời bạn nói.
                    </p>
                )}
            </div>
        </section>
    );
}
