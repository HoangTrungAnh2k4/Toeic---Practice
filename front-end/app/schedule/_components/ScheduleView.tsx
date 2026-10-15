'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LuCalendarPlus, LuUserPlus } from 'react-icons/lu';
import { useMistakeBook } from '@/app/mistakes/_lib/useMistakeBook';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/use-user-stats';
import { getMonthTaskProgress, getPlanWeekCount, getPlanWeekNo } from '@/lib/data/study-plan';
import { type ActivePlan, getActivePlan, getLatestInsight, getProfile } from '@/lib/data/user-data';
import type { AiInsight, MistakePattern, Profile } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { cn } from '@/lib/utils';
import { buildExamGoal, buildSkillProgress, buildWeek } from '../utils';
import AiRationale from './AiRationale';
import FlexibilityPanel from './FlexibilityPanel';
import ScheduleMilestones from './ScheduleMilestones';
import SchedulePageHeader from './SchedulePageHeader';
import TodayFocus from './TodayFocus';
import WeekSprint from './WeekSprint';
import WeeklyTaskTable from './WeeklyTaskTable';

interface ScheduleViewProps {
    exams: ExamSummary[];
    patterns: MistakePattern[];
}

interface PlanState {
    profile: Profile | null;
    active: ActivePlan | null;
    insight: AiInsight | null;
}

function NoPlanCard({ isGuest }: { isGuest: boolean }) {
    const Icon = isGuest ? LuUserPlus : LuCalendarPlus;

    return (
        <section className="flex flex-col items-center gap-3 bg-white shadow-sm p-10 border border-sub2/30 rounded-xl text-center">
            <span className="flex justify-center items-center bg-sub1 rounded-full size-14 text-main">
                <Icon className="size-7" aria-hidden="true" />
            </span>
            <h2 className="font-bold text-main text-lg">
                {isGuest ? 'Đăng ký để nhận lộ trình học riêng' : 'Bạn chưa có lộ trình học'}
            </h2>
            <p className="max-w-md text-subText text-sm">
                {isGuest
                    ? 'Lộ trình được xếp theo ngày thi, mục tiêu điểm và sổ lỗi của tài khoản. Bài làm ở chế độ khách chỉ lưu trên trình duyệt này.'
                    : 'Dùng “Tối ưu lộ trình (AI)” để tạo lịch học theo ngày thi và mục tiêu điểm của bạn.'}
            </p>
            {isGuest && (
                <Link href="/register" className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}>
                    <LuUserPlus className="size-4" aria-hidden="true" />
                    Đăng ký
                </Link>
            )}
        </section>
    );
}

/** Lịch học chỉ có ở tài khoản; render sau khi mount vì thống kê đọc bài làm trong localStorage. */
export default function ScheduleView({ exams, patterns }: ScheduleViewProps) {
    const stats = useUserStats(exams);
    const book = useMistakeBook(patterns, exams);
    const [state, setState] = useState<PlanState | null>(null);
    const [weekNo, setWeekNo] = useState<number | null>(null);

    useEffect(() => {
        Promise.all([getProfile(), getActivePlan(), getLatestInsight()]).then(([profile, active, insight]) =>
            setState({ profile, active, insight }),
        );
    }, []);

    if (!stats || !book || !state) {
        return (
            <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải lộ trình">
                <Skeleton className="rounded-xl h-24" />
                <Skeleton className="rounded-xl h-40" />
                <Skeleton className="rounded-xl h-72" />
            </div>
        );
    }

    const { profile, active, insight } = state;
    const header = <SchedulePageHeader rationale={active?.plan.ai_rationale ?? null} showActions={!!profile} />;
    if (!profile || !active) {
        return (
            <>
                {header}
                <NoPlanCard isGuest={!profile} />
            </>
        );
    }

    const now = new Date();
    const examById = new Map(exams.map((exam) => [exam.id, exam]));
    const weekCount = getPlanWeekCount(active);
    const currentWeekNo = Math.min(Math.max(getPlanWeekNo(active.plan, now), 1), weekCount);
    const currentWeek = buildWeek(active, currentWeekNo, now, examById);
    const week = weekNo === null ? currentWeek : buildWeek(active, weekNo, now, examById);

    return (
        <>
            {header}
            <ScheduleMilestones
                goal={buildExamGoal(profile, active.plan, stats.study.streak_days)}
                skills={buildSkillProgress(stats, profile, book)}
                monthly={getMonthTaskProgress(active.tasks, now)}
            />

            {/* Hành động trước: việc cần làm hôm nay + điều chỉnh khi bận */}
            <div className="gap-4 grid grid-cols-1 xl:grid-cols-12">
                <div className="xl:col-span-7">
                    <TodayFocus day={currentWeek.days.find((day) => day.status === 'today')} />
                </div>
                <div className="xl:col-span-5">
                    <FlexibilityPanel minutesPerDay={active.plan.minutes_per_day} />
                </div>
            </div>

            <WeekSprint week={week} weekCount={weekCount} onWeekChange={setWeekNo} />
            <AiRationale insight={insight} />
            <WeeklyTaskTable tasks={week.days.flatMap((day) => day.tasks)} />
        </>
    );
}
