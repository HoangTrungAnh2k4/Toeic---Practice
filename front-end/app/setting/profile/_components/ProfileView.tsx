'use client';

import { useEffect, useState } from 'react';
import { LuAlarmClock, LuCalendarCheck, LuFlame, LuSunMoon, LuTrophy } from 'react-icons/lu';
import { getMistakes } from '@/app/mistakes/_lib/data';
import { useMistakeBook } from '@/app/mistakes/_lib/useMistakeBook';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/use-user-stats';
import { getMonthTaskProgress, getPlanWeekNo } from '@/lib/data/study-plan';
import { type ActivePlan, getActivePlan, getProfile } from '@/lib/data/user-data';
import type { MistakePattern, Profile } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { ProfileField } from '../types';
import { formatDuration, getAverageGain, getRecentStudyDays, getScoreTrend } from '../utils';
import PartScoreCard from './PartScoreCard';
import ProfileGoalCard from './ProfileGoalCard';
import ProfileIdentityCard from './ProfileIdentityCard';
import ProfileMistakesCard from './ProfileMistakesCard';
import StudyHabitCard from './StudyHabitCard';

interface ProfileViewProps {
    exams: ExamSummary[];
    patterns: MistakePattern[];
}

const MISTAKE_LIMIT = 3;

function ProfileSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải hồ sơ">
            <Skeleton className="rounded-2xl h-56" />
            <div className="gap-6 grid grid-cols-1 xl:grid-cols-3">
                <Skeleton className="xl:col-span-2 rounded-xl h-96" />
                <Skeleton className="rounded-xl h-96" />
            </div>
            <div className="gap-6 grid grid-cols-1 xl:grid-cols-3">
                <Skeleton className="xl:col-span-2 rounded-xl h-72" />
                <Skeleton className="rounded-xl h-72" />
            </div>
        </div>
    );
}

/** Hồ sơ đọc bài làm trong localStorage → render sau khi mount. Khách không có mục tiêu, ngày thi, giờ học. */
export default function ProfileView({ exams, patterns }: ProfileViewProps) {
    const stats = useUserStats(exams);
    const book = useMistakeBook(patterns, exams);
    const [user, setUser] = useState<{ profile: Profile | null; active: ActivePlan | null } | null>(null);

    useEffect(() => {
        Promise.all([getProfile(), getActivePlan()]).then(([profile, active]) => setUser({ profile, active }));
    }, []);

    if (!stats || !book || !user) return <ProfileSkeleton />;

    const { profile, active } = user;
    const now = new Date();

    const monthly = formatDuration(stats.study.minutes_this_month);
    const habitFields: ProfileField[] = [
        { id: 'streak', label: 'Chuỗi ngày học', value: `${stats.study.streak_days} ngày`, Icon: LuFlame },
        { id: 'best', label: 'Chuỗi dài nhất', value: `${stats.study.best_streak_days} ngày`, Icon: LuTrophy },
        { id: 'month', label: 'Học trong tháng', value: `${monthly.value} ${monthly.unit}`, Icon: LuCalendarCheck },
    ];
    if (profile) {
        habitFields.push(
            { id: 'time', label: 'Giờ học quen thuộc', value: profile.preferred_time ?? 'Chưa đặt', Icon: LuSunMoon },
            { id: 'reminder', label: 'Nhắc học', value: profile.reminder_enabled ? 'Bật' : 'Tắt', Icon: LuAlarmClock },
        );
    }

    return (
        <>
            <ProfileIdentityCard
                profile={profile}
                plan={
                    active && {
                        weekNo: getPlanWeekNo(active.plan, now),
                        month: getMonthTaskProgress(active.tasks, now),
                    }
                }
            />

            <div className="items-stretch gap-6 grid grid-cols-1 xl:grid-cols-3">
                <ProfileGoalCard
                    skills={stats.skills}
                    targets={{ speaking: profile?.target_speaking ?? null, writing: profile?.target_writing ?? null }}
                    isGuest={!profile}
                    history={getScoreTrend(stats)}
                    averageGain={getAverageGain(stats)}
                    className="xl:col-span-2"
                />
                <StudyHabitCard
                    days={getRecentStudyDays(stats)}
                    goalMinutes={active?.plan.minutes_per_day ?? null}
                    fields={habitFields}
                />
            </div>

            <div className="items-stretch gap-6 grid grid-cols-1 xl:grid-cols-3">
                <PartScoreCard parts={stats.parts} className="xl:col-span-2" />
                <ProfileMistakesCard
                    limit={MISTAKE_LIMIT}
                    mistakes={getMistakes(book, {
                        skill: 'all',
                        status: 'all',
                        criterion: 'all',
                        sort: 'frequency',
                        searchQuery: '',
                    }).slice(0, MISTAKE_LIMIT)}
                />
            </div>
        </>
    );
}
