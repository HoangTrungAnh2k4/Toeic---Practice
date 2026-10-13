'use client';

import { MdPlayArrow, MdVisibility } from 'react-icons/md';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { cn } from '@/lib/utils';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { getAttemptHref } from '@/app/setting/history/utils';
import { ATTEMPTS, SkillFilter, STATUS_STYLE } from './types';
import Header from './_components/Header';
import Footer from './_components/Footer';
import { SkillBadge } from './helpers';
import { useState } from 'react';

export default function RecentAttempt() {
    const [filter, setFilter] = useState<SkillFilter>('all');
    const visibleAttempts = ATTEMPTS.filter((a) => {
        if (filter === 'speaking') return a.skills.includes('S');
        if (filter === 'writing') return a.skills.includes('W');
        return true;
    });

    return (
        <section className="flex flex-col gap-5">
            {/* Header */}
            <Header filter={filter} setFilter={setFilter} />

            {/* Table */}
            <div className="bg-white shadow-sm border border-[#8B84B8]/30 rounded-xl overflow-hidden">
                <Table>
                    <TableHeader className="bg-main">
                        <TableRow className="border-[#8B84B8]/30">
                            {['Bài luyện', 'Kỹ năng', 'Chế độ', 'Loại đề', 'Trạng thái', 'Ngày thực hiện'].map((h) => (
                                <TableHead
                                    key={h}
                                    className="px-4 h-11 font-bold text-[13px] text-white uppercase tracking-wider"
                                >
                                    {h}
                                </TableHead>
                            ))}
                            <TableHead className="px-4 h-11 font-semibold text-[#3C3454] text-xs text-right uppercase tracking-wider">
                                Hành động
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {visibleAttempts.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-[#8B84B8] text-sm text-center">
                                    Chưa có lượt làm bài nào cho kỹ năng này
                                </TableCell>
                            </TableRow>
                        )}

                        {visibleAttempts.map((a) => {
                            const st = STATUS_STYLE[a.status];
                            return (
                                <TableRow
                                    key={a.id}
                                    className="hover:bg-[#E8E5F5]/50 border-[#8B84B8]/20 transition-colors"
                                >
                                    <TableCell className="px-4 py-4 min-w-[260px] whitespace-normal">
                                        <div className="flex flex-col gap-0.5">
                                            <span className="font-semibold text-[#3C3454] text-sm">{a.title}</span>
                                            <span className="font-medium text-subText text-xs">{a.subtitle}</span>
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-4">
                                        <div className="flex flex-col gap-1">
                                            {a.skills.map((s) => (
                                                <SkillBadge key={s} skill={s} />
                                            ))}
                                        </div>
                                    </TableCell>

                                    <TableCell className="px-4 py-4 font-medium text-main text-sm">{a.mode}</TableCell>

                                    <TableCell className="px-4 py-4">
                                        <span
                                            className={cn(
                                                'px-2 py-0.5 rounded-md font-semibold text-xs',
                                                a.retake ? 'bg-[#8B84B8] text-white' : 'bg-[#E8E5F5] text-[#3C3454]',
                                            )}
                                        >
                                            {a.examType}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-4">
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-semibold text-xs',
                                                st.badge,
                                            )}
                                        >
                                            <span className={cn('rounded-full size-1.5', st.dot)} />
                                            {st.label}
                                        </span>
                                    </TableCell>

                                    <TableCell className="px-4 py-4 font-medium text-main text-sm">{a.date}</TableCell>

                                    <TableCell className="px-4 py-4 text-right">
                                        {a.status === 'interrupted' ? (
                                            <Link
                                                href={getAttemptHref(a.id)}
                                                className={buttonVariants({ variant: 'third', size: 'sm' })}
                                            >
                                                Làm tiếp
                                            </Link>
                                        ) : (
                                            <Link
                                                href={getAttemptHref(a.id)}
                                                className={buttonVariants({ variant: 'third', size: 'sm' })}
                                            >
                                                Xem lại &amp; Sửa lỗi
                                            </Link>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>

                {/* Footer / pagination */}
                <Footer />
            </div>
        </section>
    );
}
