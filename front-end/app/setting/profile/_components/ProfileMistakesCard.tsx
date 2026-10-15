'use client';

import Link from 'next/link';
import { LuArrowRight } from 'react-icons/lu';
import { getMistakes } from '@/app/mistakes/_lib/data';
import { useMistakeBook } from '@/app/mistakes/_lib/useMistakeBook';
import { getMistakeHref, MISTAKES_PATH, SKILL_META, STATUS_META } from '@/app/mistakes/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { cn } from '@/lib/utils';
import { PROFILE_CARD_CLASS } from '../utils';

interface ProfileMistakesCardProps {
    patterns: MistakePattern[];
    exams: ExamSummary[];
    limit?: number;
    className?: string;
}

/** Các mẫu lỗi lặp lại nhiều nhất, lấy từ sổ lỗi. */
export default function ProfileMistakesCard({ patterns, exams, limit = 3, className }: ProfileMistakesCardProps) {
    const book = useMistakeBook(patterns, exams);
    // Đang tải coi như danh sách rỗng: thẻ nhỏ, không đáng một skeleton riêng
    const mistakes = book
        ? getMistakes(book, { skill: 'all', status: 'all', criterion: 'all', sort: 'frequency', searchQuery: '' }).slice(0, limit)
        : [];

    return (
        <Card role="region" aria-labelledby="profile-mistakes-title" className={cn(PROFILE_CARD_CLASS, className)}>
            <CardHeader className="px-5 sm:px-6 pt-5 sm:pt-6">
                <h2 id="profile-mistakes-title" className="font-semibold text-main text-lg">
                    Lỗi hay gặp
                </h2>
                <CardDescription className="font-medium text-subText">
                    {limit} lỗi lặp lại nhiều nhất trong sổ lỗi.
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 px-5 sm:px-6 pt-5 pb-4">
                {mistakes.length === 0 ? (
                    <p className="bg-sub1/40 p-4 rounded-lg font-medium text-subText text-sm">
                        Chưa có lỗi lặp lại nào. Tiếp tục làm bài để hệ thống theo dõi.
                    </p>
                ) : (
                    <ul className="flex flex-col gap-3">
                        {mistakes.map((mistake) => {
                            const status = STATUS_META[mistake.status];
                            return (
                                <li key={mistake.id}>
                                    <Link
                                        href={getMistakeHref(mistake.id)}
                                        className="flex gap-3 bg-card hover:bg-sub1/40 p-3.5 pl-0 border border-sub2/30 rounded-lg overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                                    >
                                        <span
                                            aria-hidden="true"
                                            className={cn('-my-3.5 w-1.5 shrink-0', SKILL_META[mistake.skill].accent)}
                                        />
                                        <span className="flex flex-col flex-1 gap-1 min-w-0">
                                            <span className="font-bold text-main text-sm">{mistake.title}</span>
                                            <span className="font-medium text-subText text-xs">
                                                {SKILL_META[mistake.skill].label} · {mistake.occurrenceCount} lần
                                            </span>
                                        </span>
                                        <span
                                            className={cn(
                                                'inline-flex items-center gap-1 self-start px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider whitespace-nowrap',
                                                status.className,
                                            )}
                                        >
                                            <status.Icon className="size-3" aria-hidden="true" />
                                            {status.label}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </CardContent>

            <CardFooter className="px-5 sm:px-6 pt-0 pb-5 sm:pb-6 bg-transparent border-0">
                <Link
                    href={MISTAKES_PATH}
                    className="inline-flex items-center gap-1.5 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring font-bold text-main text-sm hover:underline"
                >
                    Mở sổ lỗi
                    <LuArrowRight className="size-4" aria-hidden="true" />
                </Link>
            </CardFooter>
        </Card>
    );
}
