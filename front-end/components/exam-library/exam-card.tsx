import Link from 'next/link';
import { ReactNode } from 'react';
import { LuBookmark, LuBookmarkCheck } from 'react-icons/lu';
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

/** Cột của hàng đề; header trong `ExamListHeader` dùng chung để thẳng cột. */
export const EXAM_ROW_GRID =
    'grid grid-cols-[minmax(0,1fr)_auto_2rem] md:grid-cols-[minmax(0,1fr)_7rem_8rem_15rem_2rem] items-center gap-x-4';

const CHIP_CLASS = 'px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider whitespace-nowrap';

const TEXT_LINK_CLASS =
    'px-1 rounded-md font-semibold text-main text-xs underline-offset-4 whitespace-nowrap hover:underline ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

const formatDate = (iso: string) => new Date(iso).toLocaleDateString('vi-VN');

/** Thời gian còn lại tới `endsAt` dạng mm:ss; `null` khi đã hết giờ. */
function formatRemaining(endsAt: string): string | null {
    const seconds = Math.floor((Date.parse(endsAt) - Date.now()) / 1000);
    if (seconds <= 0) return null;
    return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function ExamListHeader() {
    return (
        <div
            aria-hidden="true"
            className={cn(EXAM_ROW_GRID, 'hidden md:grid px-5 py-3 font-semibold text-subText text-xs')}
        >
            <span>Bộ đề</span>
            <span>Độ dài</span>
            <span>Điểm gần nhất</span>
            <span />
            <span />
        </div>
    );
}

function StatusChip({ entry }: Pick<ExamCardProps, 'entry'>) {
    const { exam, user } = entry;
    switch (user.progress) {
        case 'completed':
            return <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>Đã làm {user.completedCount} lượt</span>;
        case 'in_progress':
            return (
                <span className={cn(CHIP_CLASS, 'bg-sub3 text-main')}>
                    Đang làm {user.answeredCount}/{exam.questionCount}
                </span>
            );
        case 'not_started':
            return <span className={cn(CHIP_CLASS, 'border border-sub2/40 border-dashed text-subText')}>Chưa làm</span>;
    }
}

function ScoreCell({ entry }: Pick<ExamCardProps, 'entry'>) {
    const { user } = entry;
    const last = user.lastCompleted;

    if (user.progress === 'in_progress') {
        const endsAt = user.inProgress?.ends_at;
        if (!endsAt) return <span className="text-subText text-sm">Lưu trên máy này</span>;
        const remaining = formatRemaining(endsAt);
        return (
            <span className="text-subText text-sm">
                {remaining ? (
                    <>
                        Còn <span className="font-semibold text-main tabular-nums">{remaining}</span>
                    </>
                ) : (
                    <span className="font-semibold text-main">Đã hết giờ</span>
                )}
            </span>
        );
    }
    if (user.progress === 'completed') {
        if (last?.score === null || last?.score === undefined) {
            return <span className="font-semibold text-main text-sm">Đang chờ chấm</span>;
        }
        return (
            <span className="flex flex-col">
                <span className="font-bold text-main text-lg tabular-nums leading-tight tracking-tight">
                    {last.score}
                    <span className="font-semibold text-subText text-xs">/200</span>
                </span>
                {last.submitted_at && (
                    <span className="text-subText text-xs tabular-nums">{formatDate(last.submitted_at)}</span>
                )}
            </span>
        );
    }
    return <span className="text-subText text-sm">Chưa có</span>;
}

function RowActions({ skill, entry, isRecommended }: Omit<ExamCardProps, 'onToggleBookmark'>) {
    const { exam, user } = entry;
    let secondary: ReactNode = null;
    let primary: ReactNode;

    switch (user.progress) {
        case 'in_progress':
            primary = (
                <Link
                    href={buildTestHref(skill, exam.id, user.inProgress?.mode, user.inProgress?.part_template_id)}
                    className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'px-4 text-xs')}
                >
                    Tiếp tục làm bài
                </Link>
            );
            break;
        case 'completed':
            secondary = (
                <Link
                    href={buildHistoryHref(DEFAULT_HISTORY_QUERY, { skill, searchQuery: exam.title })}
                    className={TEXT_LINK_CLASS}
                >
                    Xem nhận xét
                </Link>
            );
            primary = (
                <Link
                    href={buildTestHref(skill, exam.id)}
                    className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'bg-white px-4 text-main text-xs')}
                >
                    Làm lại
                </Link>
            );
            break;
        case 'not_started':
            secondary = (
                <Link href={buildTestHref(skill, exam.id, 'guided')} className={TEXT_LINK_CLASS}>
                    Có hướng dẫn
                </Link>
            );
            primary = (
                <Link
                    href={buildTestHref(skill, exam.id)}
                    className={cn(
                        buttonVariants({ variant: isRecommended ? 'primary' : 'third', size: 'sm' }),
                        'px-4 text-xs',
                        !isRecommended && 'bg-white text-main',
                    )}
                >
                    Thi thử
                </Link>
            );
            break;
    }

    return (
        <div className="flex justify-end items-center gap-3">
            {secondary && <span className="hidden sm:inline">{secondary}</span>}
            {primary}
        </div>
    );
}

/** Một hàng trong danh sách đề: tên + trạng thái, độ dài, điểm, một nút chính. */
export function ExamCard({ skill, entry, isRecommended, onToggleBookmark }: ExamCardProps) {
    const { exam, user } = entry;
    const titleId = `exam-row-${exam.id}`;
    const BookmarkIcon = user.bookmarked ? LuBookmarkCheck : LuBookmark;

    return (
        <li>
            <article
                aria-labelledby={titleId}
                className={cn(EXAM_ROW_GRID, 'hover:bg-sub1/40 px-5 py-3.5 transition-colors')}
            >
                <div className="flex flex-col items-start gap-1.5 min-w-0">
                    <h3 id={titleId} className="font-semibold text-main text-sm truncate leading-snug">
                        {exam.title}
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                        <StatusChip entry={entry} />
                        {exam.source === 'ets' && (
                            <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>Chuẩn ETS</span>
                        )}
                        {isRecommended && user.progress === 'not_started' && (
                            <span className={cn(CHIP_CLASS, 'bg-sub3 text-main')}>Nên làm tiếp</span>
                        )}
                    </div>
                </div>
                <span className="hidden md:inline text-subText text-sm tabular-nums">
                    {exam.questionCount} câu, {exam.durationMin} phút
                </span>
                <span className="hidden md:block">
                    <ScoreCell entry={entry} />
                </span>
                <RowActions skill={skill} entry={entry} isRecommended={isRecommended} />
                <button
                    type="button"
                    onClick={() => onToggleBookmark(exam.id)}
                    aria-pressed={user.bookmarked}
                    aria-label={user.bookmarked ? `Bỏ đánh dấu ${exam.title}` : `Đánh dấu ${exam.title}`}
                    className={cn(
                        'flex justify-center items-center rounded-md size-8 transition-colors cursor-pointer',
                        'hover:bg-sub1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                        user.bookmarked ? 'text-main' : 'text-sub2',
                    )}
                >
                    <BookmarkIcon className="size-4" aria-hidden="true" />
                </button>
            </article>
        </li>
    );
}
