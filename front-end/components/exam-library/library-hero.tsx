'use client';

import Link from 'next/link';
import { GoDotFill } from 'react-icons/go';
import { LuArrowRight, LuHistory, LuRotateCcw, LuTimer, LuTrophy } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import type { Skill } from '@/lib/domain/types';
import { pickRecommended, toEntries } from '@/lib/exam-library/entries';
import {
    buildLibraryHref,
    buildTestHref,
    DEFAULT_LIBRARY_QUERY,
    LIBRARY_SECTION_ID,
} from '@/lib/exam-library/search-params';
import type { ExamSummary } from '@/lib/exam-library/types';
import { useUserExamStates } from '@/lib/exam-library/use-user-exam-states';
import { cn } from '@/lib/utils';
import { SKILL_COPY } from './skill-copy';

interface LibraryHeroProps {
    skill: Skill;
    exams: ExamSummary[];
}

const LINK_FOCUS_CLASS =
    'inline-flex items-center gap-1 px-1 rounded-md font-semibold text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3';

const TAG_CLASS = 'px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider';

const STAT_LABEL_CLASS = 'font-semibold text-[0.6875rem] text-sub1/80 uppercase tracking-wider';

export function LibraryHero({ skill, exams }: LibraryHeroProps) {
    const { states, loadFailed } = useUserExamStates();
    const copy = SKILL_COPY[skill];
    const loading = !states && !loadFailed;

    const entries = states ? toEntries(exams, states) : [];
    // Trước khi đọc xong tiến độ, coi mọi đề là chưa làm để khối gợi ý không bị trống
    const recommended = states ? pickRecommended(entries)?.exam : exams[0];
    const completed = entries.filter((entry) => entry.user.completedCount > 0).length;
    const percent = exams.length ? Math.round((completed / exams.length) * 100) : 0;
    const scored = entries
        .flatMap(({ user }) => (user.lastCompleted?.score != null ? [user.lastCompleted] : []))
        .sort((a, b) => (b.submitted_at ?? '').localeCompare(a.submitted_at ?? ''));
    const latest = scored[0];

    return (
        <section aria-labelledby={`${skill}-hero-title`} className="gap-4 grid grid-cols-1 xl:grid-cols-12">
            <div className="flex flex-col gap-6 xl:col-span-8 bg-main shadow-md p-5 sm:p-6 rounded-2xl">
                {recommended ? (
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className={cn(TAG_CLASS, 'bg-sub3 text-main uppercase')}>Gợi ý tiếp theo</span>
                            <span className={cn(TAG_CLASS, 'inline-flex items-center gap-1 bg-white/10 text-sub1')}>
                                <LuTimer className="size-3.5" aria-hidden="true" />
                                Chuẩn thời gian CBT
                            </span>
                        </div>

                        <h2
                            id={`${skill}-hero-title`}
                            className="font-bold text-white text-xl sm:text-2xl tracking-tight"
                        >
                            {recommended.title}
                        </h2>

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

                        <div className="flex flex-wrap items-center gap-3">
                            <Link
                                href={buildTestHref(skill, recommended.id)}
                                className={buttonVariants({ variant: 'primary', size: 'md' })}
                            >
                                Bắt đầu làm bài thi
                            </Link>
                            <Link
                                href={buildTestHref(skill, recommended.id, 'guided')}
                                className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'bg-white text-main')}
                            >
                                Luyện có hướng dẫn
                            </Link>
                            <a href="#rubric-guide" className={cn(LINK_FOCUS_CLASS, 'text-sub3')}>
                                Xem cấu trúc & tiêu chí chấm
                                <LuArrowRight className="size-3.5" aria-hidden="true" />
                            </a>
                        </div>
                    </div>
                ) : (
                    <div className="flex sm:flex-row flex-col sm:items-center gap-4">
                        <div className="flex flex-col flex-1 gap-1 min-w-0">
                            <h2 id={`${skill}-hero-title`} className="font-bold text-white text-xl tracking-tight">
                                Bạn đã làm hết các đề {copy.label}
                            </h2>
                            <p className="text-sub1 text-sm leading-relaxed">
                                Làm lại đề cũ để kiểm tra lỗi đã sửa chưa, hoặc xem lại nhận xét trong lịch sử.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Link
                                href={`${buildLibraryHref(skill, DEFAULT_LIBRARY_QUERY, { tab: 'retake' })}#${LIBRARY_SECTION_ID}`}
                                className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}
                            >
                                Làm lại đề cũ
                            </Link>
                            <Link
                                href="/setting/history"
                                className={cn(
                                    buttonVariants({ variant: 'third', size: 'md' }),
                                    'gap-2 bg-white text-main',
                                )}
                            >
                                Lịch sử
                            </Link>
                        </div>
                    </div>
                )}

                {/* Progress stats */}
                <dl className="gap-3 grid grid-cols-1 sm:grid-cols-3 mt-auto" aria-busy={loading}>
                    <div className="flex flex-col gap-1 bg-white/10 p-3 rounded-lg">
                        <dt className={STAT_LABEL_CLASS}>Bộ đề đang mở</dt>
                        <dd className="font-bold text-white text-2xl tracking-tight">{exams.length}</dd>
                    </div>
                    <div className="flex flex-col gap-2 bg-white/10 p-3 rounded-lg">
                        <dt className={STAT_LABEL_CLASS}>Đã hoàn thành</dt>
                        <dd className="flex flex-col gap-2">
                            {loading ? (
                                <Skeleton className="bg-white/20 w-20 h-8" />
                            ) : (
                                <span className="font-bold text-white text-2xl tracking-tight">
                                    {completed}
                                    <span className="font-semibold text-sub1 text-sm"> / {exams.length} đề</span>
                                </span>
                            )}
                            <Progress
                                value={percent}
                                aria-label="Tiến độ hoàn thành thư viện đề"
                                className="[&_[data-slot=progress-indicator]]:bg-sub3 [&_[data-slot=progress-track]]:bg-white/20 [&_[data-slot=progress-track]]:h-1.5"
                            />
                        </dd>
                    </div>
                    <div className="flex flex-col gap-1 bg-white/10 p-3 rounded-lg">
                        <dt className={STAT_LABEL_CLASS}>Điểm gần nhất</dt>
                        <dd className="flex flex-col gap-0.5">
                            {loading ? (
                                <Skeleton className="bg-white/20 w-20 h-8" />
                            ) : (
                                <span className="font-bold text-white text-2xl tracking-tight">
                                    {latest?.score ?? '—'}
                                    <span className="font-semibold text-sub1 text-sm"> /200</span>
                                </span>
                            )}
                            <span className="text-sub1/80 text-xs">
                                {loadFailed
                                    ? 'Chưa tải được điểm'
                                    : latest
                                      ? `Từ ${scored.length} bài đã chấm`
                                      : 'Chưa có bài nào được chấm'}
                            </span>
                        </dd>
                    </div>
                </dl>
            </div>

            {/* Pre-test room check */}
            <div className="flex flex-col gap-4 xl:col-span-4 bg-card shadow-sm p-5 border border-sub2/30 rounded-xl">
                <h3 className="font-semibold text-[0.6875rem] text-subText uppercase tracking-wider">
                    Chuẩn bị trước khi vào phòng thi
                </h3>
                <ul className="flex flex-col flex-1 gap-4">
                    {copy.roomChecks.map(({ icon: Icon, title, description }) => (
                        <li key={title} className="flex items-start gap-3">
                            <span className="flex justify-center items-center bg-sub1 rounded-lg size-9 text-main shrink-0">
                                <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="font-semibold text-main text-sm leading-tight">{title}</span>
                                <span className="font-medium text-subText text-xs leading-relaxed">{description}</span>
                            </div>
                        </li>
                    ))}
                </ul>
                <Link
                    href="/setting/device-check"
                    className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'self-start gap-1.5')}
                >
                    {copy.deviceCheckLabel}
                    <LuArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            </div>
        </section>
    );
}
