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
import LinkButton from '@/components/ui/link-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { HistoryAttempt } from '../types';
import { getAttemptHref, isRetakeAttempt, SKILL_STYLE, STORAGE_STYLE } from '../utils';

interface HistoryTableProps {
    attempts: HistoryAttempt[];
}

const COLUMNS = [
    'Mã lượt & Tên đề thi',
    'Chế độ làm',
    'Phân loại & Hỗ trợ',
    'Điểm số / Đánh giá',
    'Thời gian & Lưu trữ',
];

const MODE_ICON: Record<HistoryAttempt['modeType'], IconType> = {
    cbt: LuBadgeCheck,
    timed: LuClock,
    guided: LuGraduationCap,
};

const PRIMARY_ACTIONS = ['Xem lại chi tiết', 'Tiếp tục làm tiếp'];

export default function HistoryTable({ attempts }: HistoryTableProps) {
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
                {attempts.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={6} className="py-12">
                            <div className="flex flex-col items-center gap-2 text-center">
                                <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                                    <LuInbox className="size-6" aria-hidden="true" />
                                </span>
                                <p className="font-semibold text-main text-sm">Không tìm thấy lượt làm bài nào</p>
                                <p className="text-subText text-xs">Thử thay đổi hoặc đặt lại bộ lọc để xem thêm.</p>
                            </div>
                        </TableCell>
                    </TableRow>
                ) : (
                    attempts.map((item) => {
                        const isWarning = item.isWarningRow;
                        const isPending = item.isPendingRow;
                        const skill = SKILL_STYLE[item.skill];
                        const ModeIcon = MODE_ICON[item.modeType];
                        const storage = STORAGE_STYLE[item.storage];
                        const isRetake = isRetakeAttempt(item);

                        return (
                            <TableRow
                                key={item.id}
                                className={cn(
                                    'group border-sub2/20 hover:bg-sub1/50 transition-colors',
                                    isWarning && 'bg-sub3/10 hover:bg-sub3/15',
                                    isPending && 'bg-sub1/40',
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
                                                    {item.code}
                                                </span>
                                                <span className="bg-sub1 px-1.5 py-0.5 rounded font-semibold text-[11px] text-main">
                                                    {item.part}
                                                </span>
                                            </div>
                                            <span className="font-semibold text-main text-sm">{item.title}</span>
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
                                                {item.topic}
                                            </span>
                                        </div>
                                    </div>
                                </TableCell>

                                {/* Column 2: Exam Mode */}
                                <TableCell className="px-3 py-4">
                                    <span className="inline-flex items-center gap-1.5 font-medium text-main text-xs">
                                        <ModeIcon className="size-4 text-sub2" aria-hidden="true" />
                                        {item.mode}
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
                                            {item.categoryBadge}
                                        </span>
                                        <span className="flex items-center gap-1 font-medium text-[11px] text-subText">
                                            {item.hasSampleViewed ? (
                                                <LuEye className="size-3.5 text-sub3" aria-hidden="true" />
                                            ) : (
                                                <span className="bg-main rounded-full size-1.5" aria-hidden="true" />
                                            )}
                                            {item.assistBadge}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Column 4: Score & Evaluation */}
                                <TableCell className="px-3 py-4 whitespace-normal">
                                    <div className="flex flex-col gap-1 min-w-40">
                                        {item.scoreInfo.isScoring ? (
                                            <>
                                                <span className="inline-flex items-center gap-1.5 bg-sub3/25 px-2 py-0.5 rounded-full w-fit font-semibold text-[11px] text-main">
                                                    <LuBrain className="size-3.5 animate-pulse" aria-hidden="true" />
                                                    AI đang chấm ({item.scoreInfo.scoringProgress}%)
                                                </span>
                                                <div
                                                    role="progressbar"
                                                    aria-label="Tiến độ chấm điểm"
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    aria-valuenow={item.scoreInfo.scoringProgress}
                                                    className="bg-sub1 rounded-full w-full h-1 overflow-hidden"
                                                >
                                                    <div
                                                        className="bg-sub3 rounded-full h-full"
                                                        style={{ width: `${item.scoreInfo.scoringProgress ?? 0}%` }}
                                                    />
                                                </div>
                                                <span className="text-[11px] text-subText">
                                                    Dự kiến: {item.scoreInfo.estimatedTimeRemaining}
                                                </span>
                                            </>
                                        ) : item.scoreInfo.isInterrupted ? (
                                            <>
                                                <span className="inline-flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full ring-1 ring-sub2 ring-inset w-fit font-semibold text-[11px] text-main">
                                                    <span
                                                        className="bg-sub2 rounded-full size-1.5"
                                                        aria-hidden="true"
                                                    />
                                                    Chưa hoàn thành
                                                </span>
                                                <span className="text-[11px] text-subText">
                                                    {item.scoreInfo.interruptedReason}
                                                </span>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-bold tabular-nums text-main text-lg">
                                                        {item.scoreInfo.score}
                                                    </span>
                                                    <span className="text-sub2 text-xs">
                                                        / {item.scoreInfo.maxScore}
                                                    </span>
                                                    {item.scoreInfo.level && (
                                                        <span className="bg-sub3 ml-1 px-1.5 py-0.5 rounded font-bold text-[10px] text-main">
                                                            {item.scoreInfo.level}
                                                        </span>
                                                    )}
                                                </div>
                                                {item.scoreInfo.feedbackSummary && (
                                                    <span className="flex items-center gap-1 font-medium text-[11px] text-subText">
                                                        <LuCircleCheck
                                                            className="size-3 text-sub2 shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                        {item.scoreInfo.feedbackSummary}
                                                    </span>
                                                )}
                                                {item.scoreInfo.retakeComparison && (
                                                    <span className="font-semibold text-[11px] text-main">
                                                        {item.scoreInfo.retakeComparison}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </TableCell>

                                {/* Column 5: Submitted At, Duration & Storage */}
                                <TableCell className="px-3 py-4">
                                    <div className="flex flex-col items-start gap-1">
                                        <span className="font-semibold text-main">{item.submittedAt}</span>
                                        <span className="text-subText">Thời lượng: {item.duration}</span>
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold text-[11px]',
                                                storage.className,
                                            )}
                                        >
                                            <storage.Icon className="size-3" aria-hidden="true" />
                                            {storage.label}
                                        </span>
                                    </div>
                                </TableCell>

                                {/* Column 6: Actions */}
                                <TableCell className="px-3 py-4 text-right">
                                    <div className="inline-flex items-center gap-2">
                                        <LinkButton
                                            href={getAttemptHref(item.id)}
                                            size="sm"
                                            variant={PRIMARY_ACTIONS.includes(item.actionText) ? 'primary' : 'third'}
                                            className="justify-center px-3 w-36 h-8 text-xs"
                                        >
                                            {item.actionText}
                                        </LinkButton>
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
