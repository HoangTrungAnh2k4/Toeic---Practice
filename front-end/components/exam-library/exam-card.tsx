import Link from 'next/link';
import { ReactNode } from 'react';
import {
    LuBookmark,
    LuBookmarkCheck,
    LuCalendar,
    LuEye,
    LuGauge,
    LuGraduationCap,
    LuPlay,
    LuRotateCcw,
    LuSave,
    LuStepForward,
} from 'react-icons/lu';
import { buildHistoryHref, DEFAULT_HISTORY_QUERY } from '@/app/setting/history/_lib/searchParams';
import { buttonVariants } from '@/components/ui/button';
import type { Skill } from '@/lib/domain/types';
import { buildTestHref } from '@/lib/exam-library/search-params';
import type { LibraryEntry } from '@/lib/exam-library/types';
import { cn } from '@/lib/utils';

interface ExamCardProps {
    skill: Skill;
    entry: LibraryEntry;
    isRecommended: boolean;
    onToggleBookmark: (examId: string) => void;
}

type BadgeTone = 'main' | 'sub3' | 'neutral';

const BADGE_TONE_CLASS: Record<BadgeTone, string> = {
    main: 'bg-main text-sub3',
    sub3: 'bg-sub3 text-main',
    neutral: 'bg-sub1 text-main',
};

const SUMMARY_STRIP_CLASS =
    'flex flex-wrap justify-between items-center gap-x-3 gap-y-1 bg-sub1/50 px-3 py-2 rounded-lg font-medium text-subText text-xs';

const META_CLASS = 'inline-flex items-center gap-1 font-semibold text-subText text-xs';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

/** Thời gian còn lại tới `endsAt` dạng mm:ss; `null` khi đã hết giờ. */
function formatRemaining(endsAt: string): string | null {
    const seconds = Math.floor((Date.parse(endsAt) - Date.now()) / 1000);
    if (seconds <= 0) return null;
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

interface CardShellProps extends Pick<ExamCardProps, 'entry' | 'onToggleBookmark'> {
    badge: string;
    badgeTone: BadgeTone;
    meta: ReactNode;
    footer: ReactNode;
    className?: string;
    children?: ReactNode;
}

function CardShell({ entry, onToggleBookmark, badge, badgeTone, meta, footer, className, children }: CardShellProps) {
    const { exam, user } = entry;
    const titleId = `exam-card-${exam.id}`;
    const BookmarkIcon = user.bookmarked ? LuBookmarkCheck : LuBookmark;

    return (
        <article
            aria-labelledby={titleId}
            className={cn(
                'flex flex-col justify-between gap-4 bg-white shadow-sm hover:shadow-md p-5 border border-sub2/30 rounded-xl transition-shadow',
                className,
            )}
        >
            <div className="flex flex-col gap-2.5">
                <div className="flex justify-between items-center gap-2">
                    <span
                        className={cn(
                            'px-2 py-0.5 rounded-md font-bold text-[11px] uppercase tracking-wide',
                            BADGE_TONE_CLASS[badgeTone],
                        )}
                    >
                        {badge}
                    </span>
                    <div className="flex items-center gap-2">
                        {meta}
                        <button
                            type="button"
                            onClick={() => onToggleBookmark(exam.id)}
                            aria-pressed={user.bookmarked}
                            aria-label={user.bookmarked ? `Bỏ đánh dấu ${exam.title}` : `Đánh dấu ${exam.title}`}
                            className={cn(
                                'flex justify-center items-center rounded-md size-7 transition-colors cursor-pointer',
                                'hover:bg-sub1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                user.bookmarked ? 'text-main' : 'text-sub2',
                            )}
                        >
                            <BookmarkIcon className="size-4" aria-hidden="true" />
                        </button>
                    </div>
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-mono font-semibold text-[11px] text-sub2">{exam.code}</span>
                    <h3 id={titleId} className="font-bold text-main text-base leading-snug">
                        {exam.title}
                    </h3>
                </div>
                {children}
            </div>
            <div className="flex flex-col gap-3">{footer}</div>
        </article>
    );
}

function NotStartedCard({ skill, entry, isRecommended, onToggleBookmark }: ExamCardProps) {
    const { exam } = entry;

    return (
        <CardShell
            entry={entry}
            onToggleBookmark={onToggleBookmark}
            badge={exam.source === 'ets' ? 'Chuẩn ETS' : 'Toeco biên soạn'}
            badgeTone={exam.source === 'ets' ? 'neutral' : 'main'}
            meta={
                exam.target_level !== null && (
                    <span className={META_CLASS}>
                        <LuGauge className="size-4 text-sub2" aria-hidden="true" />
                        Level {exam.target_level}
                    </span>
                )
            }
            footer={
                <>
                    <div className={SUMMARY_STRIP_CLASS}>
                        <span>
                            {exam.questionCount} câu · {exam.durationMin} phút
                        </span>
                        <span className="font-semibold text-main">Chưa làm</span>
                    </div>
                    <div className="gap-2 grid grid-cols-2">
                        <Link
                            href={buildTestHref(skill, exam.id)}
                            className={cn(
                                buttonVariants({ variant: isRecommended ? 'primary' : 'third', size: 'sm' }),
                                'gap-1.5 px-2 text-xs',
                                !isRecommended && 'bg-white',
                            )}
                        >
                            <LuPlay className="size-4" aria-hidden="true" />
                            <span>Thi thử CBT</span>
                        </Link>
                        <Link
                            href={buildTestHref(skill, exam.id, 'guided')}
                            className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'gap-1.5 px-2 text-xs')}
                        >
                            <LuGraduationCap className="size-4" aria-hidden="true" />
                            <span>Có hướng dẫn</span>
                        </Link>
                    </div>
                </>
            }
        />
    );
}

function CompletedCard({ skill, entry, onToggleBookmark }: ExamCardProps) {
    const { exam, user } = entry;
    const last = user.lastCompleted;

    return (
        <CardShell
            entry={entry}
            onToggleBookmark={onToggleBookmark}
            badge={`Đã làm ${user.completedCount} lượt`}
            badgeTone="neutral"
            meta={
                last?.submitted_at && (
                    <span className={META_CLASS}>
                        <LuCalendar className="size-4 text-sub2" aria-hidden="true" />
                        {formatDate(last.submitted_at)}
                    </span>
                )
            }
            footer={
                <div className="gap-2 grid grid-cols-2">
                    <Link
                        href={buildHistoryHref(DEFAULT_HISTORY_QUERY, { skill, searchQuery: exam.title })}
                        className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'gap-1.5 bg-white px-2 text-xs')}
                    >
                        <LuEye className="size-4" aria-hidden="true" />
                        <span>Xem nhận xét</span>
                    </Link>
                    <Link
                        href={buildTestHref(skill, exam.id)}
                        className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-1.5 px-2 text-xs')}
                    >
                        <LuRotateCcw className="size-4" aria-hidden="true" />
                        <span>Làm lại (lần {user.completedCount + 1})</span>
                    </Link>
                </div>
            }
        >
            {last?.score !== null && last?.score !== undefined ? (
                <div className="flex items-baseline gap-1">
                    <span className="font-bold text-main text-2xl tracking-tight">{last.score}</span>
                    <span className="font-semibold text-sub2 text-xs">/200 · lượt gần nhất</span>
                </div>
            ) : (
                <p className="font-semibold text-main text-sm">Lượt gần nhất đang chờ chấm điểm</p>
            )}
            {last?.feedback_summary && (
                <p className="bg-sub1/50 p-2.5 rounded-lg text-subText text-xs leading-relaxed">
                    <strong className="font-semibold text-main">AI ghi nhận:</strong> {last.feedback_summary}
                </p>
            )}
        </CardShell>
    );
}

function InProgressCard({ skill, entry, onToggleBookmark }: ExamCardProps) {
    const { exam, user } = entry;
    const attempt = user.inProgress;
    const percent = exam.questionCount ? Math.round((user.answeredCount / exam.questionCount) * 100) : 0;
    const remaining = attempt?.ends_at ? formatRemaining(attempt.ends_at) : null;

    return (
        <CardShell
            entry={entry}
            onToggleBookmark={onToggleBookmark}
            badge="Đang làm dở"
            badgeTone="sub3"
            className="border-sub3/60"
            meta={
                <span className={META_CLASS}>
                    <LuSave className="size-4 text-sub2" aria-hidden="true" />
                    Lưu trên máy này
                </span>
            }
            footer={
                <Link
                    href={buildTestHref(skill, exam.id, attempt?.mode)}
                    className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 w-full')}
                >
                    <LuStepForward className="size-4" aria-hidden="true" />
                    <span>Tiếp tục làm bài</span>
                </Link>
            }
        >
            <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center font-medium text-subText text-xs">
                    <span>
                        Tiến độ:{' '}
                        <strong className="font-semibold text-main">
                            {user.answeredCount}/{exam.questionCount} câu
                        </strong>
                    </span>
                    {attempt?.ends_at && (
                        <span>
                            {remaining ? (
                                <>
                                    Còn lại <span className="font-mono font-semibold text-main">{remaining}</span>
                                </>
                            ) : (
                                <span className="font-semibold text-main">Đã hết giờ</span>
                            )}
                        </span>
                    )}
                </div>
                <div
                    role="progressbar"
                    aria-label="Tiến độ làm bài"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={percent}
                    className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
                >
                    <div className="bg-sub3 rounded-full h-full" style={{ width: `${percent}%` }} />
                </div>
            </div>
        </CardShell>
    );
}

export function ExamCard(props: ExamCardProps) {
    switch (props.entry.user.progress) {
        case 'not_started':
            return <NotStartedCard {...props} />;
        case 'in_progress':
            return <InProgressCard {...props} />;
        case 'completed':
            return <CompletedCard {...props} />;
    }
}
