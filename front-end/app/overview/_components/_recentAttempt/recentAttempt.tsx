'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LuArrowRight } from 'react-icons/lu';
import { countSkills } from '@/app/setting/history/_lib/data';
import { useHistoryRows } from '@/app/setting/history/_lib/useHistoryRows';
import type { SkillType, StatusFilterType } from '@/app/setting/history/types';
import {
    formatDateTime,
    getAttemptAction,
    getPartLabel,
    MODE_LABEL,
    SKILL_STYLE,
    STATUS_GROUP,
} from '@/app/setting/history/utils';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { ExamSummary } from '@/lib/exam-library/types';
import { cn } from '@/lib/utils';
import Header from './_components/Header';

interface RecentAttemptProps {
    exams: ExamSummary[];
}

const LIMIT = 5;

const COLUMNS = ['Bài luyện', 'Kỹ năng', 'Chế độ', 'Loại đề', 'Trạng thái', 'Ngày thực hiện'];

const STATUS_STYLE: Record<Exclude<StatusFilterType, 'all'>, { label: string; badge: string; dot: string }> = {
    scored: { label: 'Đã chấm', badge: 'bg-sub1 text-main', dot: 'bg-main' },
    pending: { label: 'Đang chấm', badge: 'bg-sub3/25 text-main', dot: 'bg-sub3' },
    in_progress: { label: 'Đang làm dở', badge: 'bg-white text-main ring-1 ring-inset ring-sub2', dot: 'bg-sub2' },
    interrupted: { label: 'Bị gián đoạn', badge: 'bg-white text-main ring-1 ring-inset ring-sub2', dot: 'bg-sub2' },
};

export default function RecentAttempt({ exams }: RecentAttemptProps) {
    const [filter, setFilter] = useState<SkillType>('all');
    const rows = useHistoryRows(exams);

    if (!rows) return <Skeleton className="rounded-xl h-72" aria-label="Đang tải hoạt động gần đây" />;

    const visible = rows.filter((row) => filter === 'all' || row.exam.skill === filter).slice(0, LIMIT);

    return (
        <section className="flex flex-col gap-5">
            <Header filter={filter} setFilter={setFilter} counts={countSkills(rows)} limit={LIMIT} />

            <div className="bg-white shadow-sm border border-sub2/30 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-main">
                        <TableRow className="hover:bg-main border-sub2/30">
                            {COLUMNS.map((h) => (
                                <TableHead
                                    key={h}
                                    className="px-4 h-11 font-bold text-[13px] text-white uppercase tracking-wider"
                                >
                                    {h}
                                </TableHead>
                            ))}
                            <TableHead className="px-4 h-11 font-bold text-[13px] text-white text-right uppercase tracking-wider">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {visible.length === 0 && (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={7} className="h-24 text-subText text-sm text-center">
                                    {rows.length === 0
                                        ? 'Bạn chưa làm bài nào. Chọn một đề Speaking hoặc Writing để bắt đầu.'
                                        : 'Chưa có lượt làm bài nào cho kỹ năng này'}
                                </TableCell>
                            </TableRow>
                        )}

                        {visible.map((row) => {
                            const { attempt, exam, attemptNo } = row;
                            const status = STATUS_STYLE[STATUS_GROUP[attempt.status]];
                            const skill = SKILL_STYLE[exam.skill];
                            const action = getAttemptAction(row);
                            return (
                                <TableRow key={attempt.id} className="hover:bg-sub1/50 border-sub2/20 transition-colors">
                                    <TableCell className="px-4 py-4 min-w-64 whitespace-normal">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-main text-sm">{exam.title}</span>
                                            <span className="font-medium text-subText text-xs">
                                                {exam.code} • {getPartLabel(attempt)}
                                            </span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-4">
                                        <span
                                            className={cn(
                                                'inline-flex justify-center px-2 py-1 rounded-md w-full font-semibold text-xs',
                                                skill.className,
                                            )}
                                        >
                                            {skill.label}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-4 font-medium text-main text-sm">
                                        {MODE_LABEL[attempt.mode]}
                                    </TableCell>

                                    <TableCell className="px-4 py-4">
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-md font-semibold text-xs',
                                                attemptNo > 1 ? 'bg-sub2 text-white' : 'bg-sub1 text-main',
                                            )}
                                        >
                                            {attemptNo > 1 ? `Làm lại #${attemptNo}` : 'Làm lần đầu'}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-4">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-xs',
                                                status.badge,
                                            )}
                                        >
                                            <span className={cn('rounded-full size-1.5', status.dot)} aria-hidden="true" />
                                            {status.label}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-4 font-medium text-main text-sm">
                                        {formatDateTime(attempt.submitted_at ?? attempt.started_at)}
                                    </TableCell>

                                    <TableCell className="px-4 py-4 text-right">
                                        <Link
                                            href={action.href}
                                            className={buttonVariants({ variant: action.primary ? 'primary' : 'third', size: 'sm' })}
                                        >
                                            {action.label}
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                <div className="flex justify-end bg-white px-4 py-3 border-sub2/20 border-t">
                    <Link
                        href="/setting/history"
                        className="inline-flex items-center gap-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-semibold text-main text-sm hover:underline"
                    >
                        Xem toàn bộ lịch sử
                        <LuArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </div>
        </section>
    );
}
