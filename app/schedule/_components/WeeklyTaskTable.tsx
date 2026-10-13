import Link from 'next/link';
import { LuCalendarClock, LuCircle, LuCircleCheck, LuCirclePlay, LuInbox } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import LinkButton from '@/components/ui/link-button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { SKILL_STYLE } from '../_lib/skillStyle';
import { TaskStatus, WeeklyTask } from '../types';
import { formatMinutes } from '../utils';

interface WeeklyTaskTableProps {
    tasks: WeeklyTask[];
}

const COLUMNS = ['Kỹ năng', 'Chủ đề bài học', 'Mục tiêu đầu ra (Rubric)', 'Thời lượng', 'Trạng thái'];

const STATUS_STYLE: Record<TaskStatus, { Icon: IconType; label: string; className: string }> = {
    done: { Icon: LuCircleCheck, label: 'Hoàn thành', className: 'bg-sub1 text-main' },
    today: { Icon: LuCirclePlay, label: 'Cần học hôm nay', className: 'bg-sub3 text-main' },
    todo: { Icon: LuCircle, label: 'Chưa làm', className: 'bg-white text-main ring-1 ring-inset ring-sub2' },
    scheduled: { Icon: LuCalendarClock, label: 'Đã lên lịch', className: 'bg-sub1/50 text-subText' },
};

export default function WeeklyTaskTable({ tasks }: WeeklyTaskTableProps) {
    return (
        <section
            aria-labelledby="weekly-task-title"
            className="flex flex-col bg-white shadow-sm border border-sub2/30 rounded-xl overflow-hidden"
        >
            <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-2 p-5">
                <div className="flex flex-col gap-0.5">
                    <h2 id="weekly-task-title" className="font-bold text-main text-lg">
                        Danh mục bài tập trọng điểm trong tuần
                    </h2>
                    <p className="font-medium text-subText text-xs">
                        {tasks.length} học phần được tổng hợp để đạt mục tiêu S160 / W170.
                    </p>
                </div>
            </div>

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
                    {tasks.length === 0 ? (
                        <TableRow className="hover:bg-transparent">
                            <TableCell colSpan={COLUMNS.length + 1} className="py-12">
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                                        <LuInbox className="size-6" aria-hidden="true" />
                                    </span>
                                    <p className="font-semibold text-main text-sm">Chưa có bài tập cho tuần này</p>
                                    <p className="text-subText text-xs">
                                        Dùng “Tối ưu lộ trình (AI)” để hệ thống đề xuất bài phù hợp.
                                    </p>
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : (
                        tasks.map((task) => {
                            const skill = SKILL_STYLE[task.skill];
                            const status = STATUS_STYLE[task.status];
                            const isToday = task.status === 'today';

                            return (
                                <TableRow
                                    key={task.id}
                                    className={cn(
                                        'border-sub2/20 hover:bg-sub1/50 transition-colors',
                                        isToday && 'bg-sub3/10 hover:bg-sub3/15',
                                    )}
                                >
                                    <TableCell className="px-3 py-4">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2 py-1 rounded-md font-semibold text-[11px]',
                                                skill.className,
                                            )}
                                        >
                                            <skill.Icon className="size-3.5" aria-hidden="true" />
                                            {task.partLabel}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3 py-4 min-w-56 whitespace-normal">
                                        <span className="font-semibold text-main text-sm">{task.topic}</span>
                                    </TableCell>
                                    <TableCell className="px-3 py-4 min-w-64 whitespace-normal">
                                        <span className="text-subText leading-relaxed">{task.rubric}</span>
                                    </TableCell>
                                    <TableCell className="px-3 py-4 font-medium tabular-nums text-main">
                                        {formatMinutes(task.duration)}
                                    </TableCell>
                                    <TableCell className="px-3 py-4">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-semibold text-[11px]',
                                                status.className,
                                            )}
                                        >
                                            <status.Icon className="size-3.5" aria-hidden="true" />
                                            {task.statusLabel ?? status.label}
                                        </span>
                                    </TableCell>
                                    <TableCell className="px-3 py-4 text-right">
                                        {isToday ? (
                                            <LinkButton
                                                href={task.href}
                                                variant="primary"
                                                size="sm"
                                                className="text-xs"
                                            >
                                                {task.actionLabel}
                                            </LinkButton>
                                        ) : (
                                            <Link
                                                href={task.href}
                                                className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold text-main text-xs hover:underline underline-offset-4 whitespace-nowrap"
                                            >
                                                {task.actionLabel}
                                            </Link>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </section>
    );
}
