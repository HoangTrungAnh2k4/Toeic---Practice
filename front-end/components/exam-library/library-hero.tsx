'use client';

import Link from 'next/link';
import { LuArrowRight, LuBadgeCheck, LuCirclePlay, LuClock, LuGraduationCap, LuListOrdered, LuTimer } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import type { Skill } from '@/lib/domain/types';
import { pickRecommended, toEntries } from '@/lib/exam-library/entries';
import { buildTestHref } from '@/lib/exam-library/search-params';
import type { ExamSummary } from '@/lib/exam-library/types';
import { useUserExamStates } from '@/lib/exam-library/use-user-exam-states';
import { cn } from '@/lib/utils';
import { SKILL_COPY } from './skill-copy';
import { GoDotFill } from 'react-icons/go';

interface LibraryHeroProps {
    skill: Skill;
    exams: ExamSummary[];
}

const LINK_FOCUS_CLASS =
    'inline-flex items-center gap-1 px-1 rounded-md font-semibold text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

export function LibraryHero({ skill, exams }: LibraryHeroProps) {
    const { states } = useUserExamStates();
    const copy = SKILL_COPY[skill];
    // Trước khi đọc xong tiến độ, coi mọi đề là chưa làm để khối gợi ý không bị trống
    const recommended = states ? pickRecommended(toEntries(exams, states))?.exam : exams[0];

    return (
        <section aria-labelledby={`${skill}-hero-title`} className="gap-4 grid grid-cols-1 lg:grid-cols-12">
            {/* Featured recommended test */}
            <div className="flex flex-col justify-between gap-6 lg:col-span-7 bg-main shadow-main/20 shadow-md p-5 sm:p-6 rounded-xl">
                {recommended ? (
                    <>
                        <div className="flex flex-col gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="bg-sub3 px-2 py-0.5 rounded-md font-bold text-[11px] text-main uppercase tracking-wide">
                                    Gợi ý tiếp theo
                                </span>
                                <span className="bg-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-sub1">
                                    Phần thi {copy.verb} · Ấn bản {recommended.edition}
                                </span>
                                <span className="inline-flex items-center gap-1 bg-white/10 px-2 py-0.5 rounded-md font-semibold text-[11px] text-sub1">
                                    <LuTimer className="size-3.5" aria-hidden="true" />
                                    Chuẩn thời gian CBT
                                </span>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <h2
                                    id={`${skill}-hero-title`}
                                    className="font-bold text-white text-xl sm:text-2xl tracking-tight"
                                >
                                    {recommended.title}
                                </h2>
                            </div>

                            <ul className="flex flex-wrap gap-x-4 gap-y-2 font-medium text-sub1 text-xs">
                                <li className="flex items-center gap-1.5">
                                    <GoDotFill className="size-4 text-sub3" aria-hidden="true" />
                                    {recommended.questionCount} câu hỏi thi {copy.verb}
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <GoDotFill className="size-4 text-sub3" aria-hidden="true" />
                                    {recommended.durationMin} phút làm bài
                                </li>
                                <li className="flex items-center gap-1.5">
                                    <GoDotFill className="size-4 text-sub3" aria-hidden="true" />
                                    Đủ {recommended.partCount} phần chuẩn ETS
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={buildTestHref(skill, recommended.id)}
                                className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}
                            >
                                <span>Bắt đầu làm bài thi</span>
                            </Link>
                            <Link
                                href={buildTestHref(skill, recommended.id, 'guided')}
                                className={cn(
                                    buttonVariants({ variant: 'third', size: 'md' }),
                                    'gap-2 bg-white text-main',
                                )}
                            >
                                <span>Luyện có hướng dẫn</span>
                            </Link>
                            <a href="#rubric-guide" className={cn(LINK_FOCUS_CLASS, 'text-sub3')}>
                                Xem cấu trúc & tiêu chí chấm
                                <LuArrowRight className="size-3.5" aria-hidden="true" />
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-2">
                        <h2 id={`${skill}-hero-title`} className="font-bold text-white text-xl tracking-tight">
                            Bạn đã làm hết các đề {copy.label}
                        </h2>
                        <p className="text-sub1 text-sm leading-relaxed">
                            Làm lại đề cũ trong tab “Làm lại” để kiểm tra lỗi đã khắc phục chưa.
                        </p>
                    </div>
                )}
            </div>

            {/* Pre-test room check */}
            <div className="flex flex-col justify-between gap-4 lg:col-span-5 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl">
                <div className="flex flex-col gap-3">
                    <h3 className="font-semibold text-subText text-xs uppercase tracking-wider">
                        Chuẩn bị trước khi vào phòng thi
                    </h3>
                    <ul className="flex flex-col gap-2">
                        {copy.roomChecks.map(({ icon: Icon, title, description }) => (
                            <li key={title} className="flex items-start gap-3 bg-sub1/50 p-3 rounded-lg">
                                <span className="flex justify-center items-center bg-main rounded-md size-8 text-sub3 shrink-0">
                                    <Icon className="size-4" aria-hidden="true" />
                                </span>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="font-semibold text-main text-sm leading-tight">{title}</span>
                                    <span className="text-subText text-xs leading-relaxed">{description}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                <Link
                    href="/setting/device-check"
                    className={cn(LINK_FOCUS_CLASS, 'self-start gap-1.5 pt-3 border-sub2/20 border-t w-full text-main')}
                >
                    {copy.deviceCheckLabel}
                    <LuArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
