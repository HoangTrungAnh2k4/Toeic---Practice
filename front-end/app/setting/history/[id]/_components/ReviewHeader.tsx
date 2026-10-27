import Link from 'next/link';
import { LuArrowLeft, LuCalendar, LuClock, LuEye, LuTrendingDown, LuTrendingUp, LuTriangleAlert } from 'react-icons/lu';
import { getScoreLevel, SCORE_LEVELS } from '@/lib/domain/score-levels';
import { cn } from '@/lib/utils';
import { HistoryRow } from '../../types';
import {
    formatDateTime,
    formatDuration,
    getAttemptCode,
    getPartLabel,
    MODE_LABEL,
    SKILL_STYLE,
    STATUS_GROUP,
} from '../../utils';

interface ReviewHeaderProps {
    row: HistoryRow;
}

const CHIP_CLASS =
    'inline-flex items-center gap-1 bg-sub1/10 px-2 py-0.5 rounded-md ring-1 ring-sub1/20 font-semibold text-[0.6875rem] text-sub1 tracking-wider';

/** Banner đầu trang: thông tin lượt làm bên trái, điểm quy đổi bên phải (chỉ khi đã chấm). */
export default function ReviewHeader({ row }: ReviewHeaderProps) {
    const { attempt, exam, attemptNo } = row;
    const skill = SKILL_STYLE[exam.skill];
    const duration = formatDuration(attempt);
    const isScored = STATUS_GROUP[attempt.status] === 'scored';

    return (
        <div className="flex flex-col gap-3">
            <Link
                href="/setting/history"
                className="inline-flex items-center gap-1.5 hover:bg-sub1 -ml-2 px-2 py-1 rounded-lg w-fit font-semibold text-main text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về lịch sử làm bài
            </Link>

            <section
                aria-label="Thông tin lượt làm"
                className={cn(
                    'grid grid-cols-1 bg-main shadow-main/20 shadow-md rounded-2xl overflow-hidden',
                    isScored && 'lg:grid-cols-[minmax(0,1fr)_20rem]',
                )}
            >
                <div className="flex flex-col gap-4 p-5 sm:p-7 min-w-0">
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                'flex justify-center items-center rounded-xl ring-1 ring-sub1/25 size-10 shrink-0',
                                skill.className,
                            )}
                        >
                            <skill.Icon className="size-5" aria-hidden="true" />
                        </span>
                        <p className="font-semibold tabular-nums text-sub1/80 text-xs uppercase tracking-wider">
                            {exam.code} · Lượt {getAttemptCode(attempt)}
                        </p>
                    </div>

                    <h1 className="font-bold text-sub1 text-2xl sm:text-3xl text-balance tracking-tight">{exam.title}</h1>

                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className={cn(CHIP_CLASS, 'bg-sub3 ring-sub3 text-main')}>{skill.label}</span>
                        <span className={CHIP_CLASS}>{getPartLabel(attempt)}</span>
                        <span className={CHIP_CLASS}>{MODE_LABEL[attempt.mode]}</span>
                        <span className={CHIP_CLASS}>{attemptNo > 1 ? `Làm lại #${attemptNo}` : 'Làm lần đầu'}</span>
                        <span className={CHIP_CLASS}>
                            {attempt.sample_viewed && <LuEye className="size-3" aria-hidden="true" />}
                            {attempt.sample_viewed ? 'Có xem bài mẫu' : 'Không trợ giúp'}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-auto font-medium text-sub1/80 text-xs">
                        <span className="flex items-center gap-1.5">
                            <LuCalendar className="size-3.5" aria-hidden="true" />
                            {formatDateTime(attempt.submitted_at ?? attempt.started_at)}
                        </span>
                        {duration && (
                            <span className="flex items-center gap-1.5">
                                <LuClock className="size-3.5" aria-hidden="true" />
                                {duration}
                            </span>
                        )}
                    </div>
                </div>

                {isScored && <ScorePanel row={row} />}
            </section>
        </div>
    );
}

function ScorePanel({ row }: ReviewHeaderProps) {
    const { attempt, exam, scoreDelta } = row;
    const { score, scoring_error: scoringError } = attempt;
    const maxLevel = Math.max(...SCORE_LEVELS.filter((level) => level.skill === exam.skill).map(({ level }) => level));
    const DeltaIcon = scoreDelta !== null && scoreDelta < 0 ? LuTrendingDown : LuTrendingUp;

    return (
        <div className="flex flex-col justify-center gap-3 bg-sub1/5 p-5 sm:p-7 border-sub1/15 border-t lg:border-t-0 lg:border-l">
            <span className="font-semibold text-sub1/80 text-xs uppercase tracking-wider">
                {attempt.part_template_id === null ? 'Điểm quy đổi' : 'Điểm quy đổi của Part'}
            </span>
            <div className="flex flex-wrap items-end gap-x-3 gap-y-2">
                <p className="flex items-baseline gap-1.5">
                    <span className="font-bold tabular-nums text-sub1 text-5xl leading-none tracking-tight">
                        {score ?? '—'}
                    </span>
                    <span className="font-semibold text-sub1/70 text-base">/ 200</span>
                </p>
                {score !== null && (
                    <span className="bg-sub3 mb-1 px-2 py-0.5 rounded-md font-bold text-[0.6875rem] text-main tracking-wider">
                        Level {getScoreLevel(exam.skill, score)}/{maxLevel}
                    </span>
                )}
            </div>
            {score !== null && (
                <progress
                    value={score}
                    max={200}
                    aria-label={`Điểm ${score} trên 200`}
                    className="[&::-webkit-progress-bar]:bg-sub1/15 [&::-moz-progress-bar]:bg-sub3 [&::-webkit-progress-value]:bg-sub3 bg-sub1/15 rounded-full [&::-webkit-progress-bar]:rounded-full [&::-webkit-progress-value]:rounded-full w-full h-2 overflow-hidden appearance-none"
                />
            )}
            {scoreDelta !== null && (
                <p className="flex items-center gap-1.5 font-semibold text-sub1 text-xs">
                    <DeltaIcon className="size-4 text-sub3" aria-hidden="true" />
                    {scoreDelta >= 0 ? '+' : ''}
                    {scoreDelta} điểm so với lượt trước
                </p>
            )}
            {/* feedback_summary chỉ là nhận xét từng câu ghép lại, đã hiện ở card mỗi câu nên không lặp ở đây */}
            {scoringError && (
                <p role="alert" className="flex items-start gap-1.5 font-semibold text-sub1 text-xs">
                    <LuTriangleAlert className="mt-px size-3.5 text-sub3 shrink-0" aria-hidden="true" />
                    {scoringError}
                </p>
            )}
        </div>
    );
}
