import {
    LuBadgeCheck,
    LuBrain,
    LuCircleCheck,
    LuClock,
    LuEllipsisVertical,
    LuEye,
    LuGraduationCap,
    LuInbox,
    LuTriangleAlert,
} from 'react-icons/lu';
import type { IconType } from 'react-icons';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { getScoreLevel } from '@/lib/domain/score-levels';
import type { AttemptMode } from '@/lib/domain/types';
import { buildTestHref } from '@/lib/exam-library/search-params';
import { cn } from '@/lib/utils';
import { HistoryRow } from '../types';
import {
    formatDateTime,
    formatDuration,
    getAttemptCode,
    getAttemptHref,
    getPartLabel,
    MODE_LABEL,
    SKILL_STYLE,
    STATUS_GROUP,
} from '../utils';

interface HistoryTableProps {
    rows: HistoryRow[];
    /** Phân biệt "chưa làm bài nào" với "bộ lọc không khớp". */
    hasAnyAttempt: boolean;
}

const COLUMNS = [
    'Mã lượt & Tên đề thi',
    'Chế độ làm',
    'Phân loại & Hỗ trợ',
    'Điểm số / Đánh giá',
    'Thời gian',
];

const MODE_ICON: Record<AttemptMode, IconType> = {
    cbt: LuBadgeCheck,
    timed: LuClock,
    guided: LuGraduationCap,
};

const BADGE_CLASS = 'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full w-fit font-semibold text-[11px] text-main';

function getAction({ attempt, exam }: HistoryRow) {
    switch (STATUS_GROUP[attempt.status]) {
        case 'in_progress':
            return { label: 'Tiếp tục làm bài', href: buildTestHref(exam.skill, exam.id, attempt.mode), primary: true };
        case 'scored':
            return { label: 'Xem lại chi tiết', href: getAttemptHref(attempt.id), primary: true };
        case 'pending':
            return { label: 'Xem bài đã nộp', href: getAttemptHref(attempt.id), primary: false };
        default:
            return { label: 'Xem chi tiết', href: getAttemptHref(attempt.id), primary: false };
    }
}

function ScoreCell({ row }: { row: HistoryRow }) {
    const { attempt, exam, scoreDelta, answeredCount, questionCount } = row;
    const group = STATUS_GROUP[attempt.status];
    const progress = `Đã lưu ${answeredCount}/${questionCount} câu`;

    if (group === 'pending') {
        return (
            <>
                <span className={cn(BADGE_CLASS, 'bg-sub3/25')}>
                    <LuBrain className="size-3.5 animate-pulse" aria-hidden="true" />
                    AI đang chấm
                </span>
                {attempt.scoring_error && <span className="text-[11px] text-subText">{attempt.scoring_error}</span>}
            </>
        );
    }

    if (group === 'in_progress' || group === 'interrupted') {
        return (
            <>
                <span className={cn(BADGE_CLASS, 'bg-white ring-1 ring-sub2 ring-inset')}>
                    <span className="bg-sub2 rounded-full size-1.5" aria-hidden="true" />
                    {group === 'in_progress' ? 'Đang làm dở' : 'Chưa hoàn thành'}
                </span>
                <span className="text-[11px] text-subText">{progress}</span>
            </>
        );
    }

    return (
        <>
            <div className="flex items-baseline gap-1">
                <span className="font-bold tabular-nums text-main text-lg">{attempt.score ?? '—'}</span>
                <span className="text-sub2 text-xs">/ 200</span>
                {attempt.score !== null && (
                    <span className="bg-sub3 ml-1 px-1.5 py-0.5 rounded font-bold text-[10px] text-main">
                        Level {getScoreLevel(exam.skill, attempt.score)}
                    </span>
                )}
            </div>
            {attempt.feedback_summary && (
                <span className="flex items-center gap-1 font-medium text-[11px] text-subText">
                    <LuCircleCheck className="size-3 text-sub2 shrink-0" aria-hidden="true" />
                    {attempt.feedback_summary}
                </span>
            )}
            {scoreDelta !== null && (
                <span className="font-semibold text-[11px] text-main">
                    {scoreDelta >= 0 ? '+' : ''}
                    {scoreDelta} điểm so với lượt trước
                </span>
            )}
        </>
    );
}

function EmptyRow({ hasAnyAttempt }: { hasAnyAttempt: boolean }) {
    return (
        <TableRow className="hover:bg-transparent">
            <TableCell colSpan={6} className="py-12">
                <div className="flex flex-col items-center gap-2 text-center">
                    <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                        <LuInbox className="size-6" aria-hidden="true" />
                    </span>
                    {hasAnyAttempt ? (
                        <>
                            <p className="font-semibold text-main text-sm">Không tìm thấy lượt làm bài nào</p>
                            <p className="text-subText text-xs">Thử thay đổi hoặc đặt lại bộ lọc để xem thêm.</p>
                        </>
                    ) : (
                        <>
                            <p className="font-semibold text-main text-sm">Bạn chưa làm bài nào</p>
                            <p className="text-subText text-xs">Chọn một đề để bắt đầu, lượt làm sẽ hiện tại đây.</p>
                            <div className="flex gap-2 mt-2">
                                <Link href="/speaking" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'text-xs')}>
                                    Đề Speaking
                                </Link>
                                <Link href="/writing" className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'text-xs')}>
                                    Đề Writing
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </TableCell>
        </TableRow>
    );
}

export default function HistoryTable({ rows, hasAnyAttempt }: HistoryTableProps) {
    return (
        <Table>
            <TableHeader className="bg-main">
                <TableRow className="hover:bg-main border-sub2/30">
                    {COLUMNS.map((h) => (
                        <TableHead
                            key={h}
                            className="px-3 h-11 font-bold text-[12px] text-white uppercase tracking-wider"
                        >
                            {h}
                        </TableHead>
                    ))}
                    <TableHead className="px-3 h-11 font-bold text-[12px] text-white text-right uppercase tracking-wider">
                        Thao tác
                    </TableHead>
                </TableRow>
            </TableHeader>

            <TableBody className="text-xs">
                {rows.length === 0 ? (
                    <EmptyRow hasAnyAttempt={hasAnyAttempt} />
                ) : (
                    rows.map((row) => {
                        const { attempt, exam, attemptNo } = row;
                        const group = STATUS_GROUP[attempt.status];
                        const isWarning = group === 'interrupted';
                        const skill = SKILL_STYLE[exam.skill];
                        const ModeIcon = MODE_ICON[attempt.mode];
                        const isRetake = attemptNo > 1;
                        const duration = formatDuration(attempt);
                        const action = getAction(row);

                        return (
                            <TableRow
                                key={attempt.id}
                                className={cn(
                                    'group border-sub2/20 hover:bg-sub1/50 transition-colors',
                                    isWarning && 'bg-sub3/10 hover:bg-sub3/15',
                                    group === 'pending' && 'bg-sub1/40',
                                )}
                            >
                                {/* Column 1: Test Identity */}
                                <TableCell className="px-3 py-4 min-w-64 whitespace-normal">
                                    <div className="flex items-start gap-3">
                                        <span
                                            className={cn(
                                                'flex justify-center items-center shadow-sm rounded-lg size-9 shrink-0',
                                                skill.className,
                                            )}
                                            title={skill.label}
                                        >
                                            <skill.Icon className="size-4" aria-hidden="true" />
                                            <span className="sr-only">{skill.label}</span>
                                        </span>
                                        <div className="flex flex-col gap-0.5">
                                            <div className="flex items-center gap-1.5">
                                                <span className="font-semibold text-sub2 tabular-nums">
                                                    {getAttemptCode(attempt)}
                                                </span>
                                                <span className="bg-sub1 px-1.5 py-0.5 rounded font-semibold text-[11px] text-main">
                                                    {getPartLabel(attempt)}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-main text-sm">{exam.title}</span>
                                            <span
                                                className={cn(
                                                    'flex items-center gap-1 text-xs',
                                                    isWarning ? 'font-semibold text-main' : 'font-medium text-subText',
                                                )}
                                            >
                                                {isWarning && (
                                                    <LuTriangleAlert
                                                        className="size-3.5 text-sub3 shrink-0"
                                                        aria-hidden="true"
                                                    />
                                                )}
                                                {exam.code}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Column 2: Exam Mode */}
                                <TableCell className="px-3 py-4">
                                    <span className="inline-flex items-center gap-1.5 font-medium text-main text-xs">
                                        <ModeIcon className="size-4 text-sub2" aria-hidden="true" />
                                        {MODE_LABEL[attempt.mode]}
                                    </span>
                                </TableCell>

                                {/* Column 3: Category & Assistance */}
                                <TableCell className="px-3 py-4">
                                    <div className="flex flex-col items-start gap-1.5">
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-md font-semibold text-[11px]',
                                                isRetake ? 'bg-sub2 text-white' : 'bg-sub1 text-main',
                                            )}
                                        >
                                            {isRetake ? `Làm lại #${attemptNo}` : 'Làm lần đầu'}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-[11px] text-subText">
                                            {attempt.sample_viewed ? (
                                                <LuEye className="size-3.5 text-sub3" aria-hidden="true" />
                                            ) : (
                                                <span className="bg-main rounded-full size-1.5" aria-hidden="true" />
                                            )}
                                            {attempt.sample_viewed ? 'Có xem bài mẫu' : 'Không trợ giúp'}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Column 4: Score & Evaluation */}
                                <TableCell className="px-3 py-4 whitespace-normal">
                                    <div className="flex flex-col gap-1 min-w-40">
                                        <ScoreCell row={row} />
                                    </div>
                                </TableCell>

                                {/* Column 5: Started/Submitted At & Duration */}
                                <TableCell className="px-3 py-4">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-semibold text-main">
                                            {formatDateTime(attempt.submitted_at ?? attempt.started_at)}
                                        </span>
                                        <span className="text-subText">
                                            {duration ? `Thời lượng: ${duration}` : 'Chưa nộp bài'}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Column 6: Actions */}
                                <TableCell className="px-3 py-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                        <Link
                                            href={action.href}
                                            className={cn(
                                                buttonVariants({ variant: action.primary ? 'primary' : 'third', size: 'sm' }),
                                                'justify-center px-3 w-36 h-8 text-xs',
                                            )}
                                        >
                                            {action.label}
                                        </Link>
                                        <button
                                            type="button"
                                            aria-label="Thao tác khác"
                                            className="hover:bg-sub1 p-1.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 text-sub2 hover:text-main transition-colors cursor-pointer"
                                        >
                                            <LuEllipsisVertical className="size-4" aria-hidden="true" />
                                        </button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );
}
