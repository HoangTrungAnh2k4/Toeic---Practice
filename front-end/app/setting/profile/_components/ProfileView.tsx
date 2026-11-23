'use client';

import { LoadError } from '@/components/load-error';
import { Skeleton } from '@/components/ui/skeleton';
import { combineAsync, useAsync } from '@/hooks/use-async';
import { useUserStats } from '@/hooks/use-user-stats';
import { getProfile } from '@/lib/data/user-data';
import type { ExamSummary } from '@/lib/exam-library/types';
import { getAverageGain, getScoreTrend } from '../utils';
import PartScoreCard from './PartScoreCard';
import ProfileIdentityCard from './ProfileIdentityCard';
import ProfileScoreCard from './ProfileScoreCard';

interface ProfileViewProps {
    exams: ExamSummary[];
}

// Bọc trong object: `useAsync` dùng `null` cho "chưa tải xong", còn khách thì profile cũng là `null`
const loadUser = async () => ({ profile: await getProfile() });

function ProfileSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải hồ sơ">
            <Skeleton className="rounded-2xl h-56" />
            <Skeleton className="rounded-xl h-96" />
            <Skeleton className="rounded-xl h-72" />
        </div>
    );
}

/** Hồ sơ đọc bài làm trong localStorage → render sau khi mount. */
export default function ProfileView({ exams }: ProfileViewProps) {
    const statsState = useUserStats(exams);
    const userState = useAsync(loadUser);
    const { failed, retry } = combineAsync(statsState, userState);
    const { data: stats } = statsState;
    const { data: user } = userState;

    if (failed) return <LoadError message="Không tải được hồ sơ học tập." onRetry={retry} />;
    if (!stats || !user) return <ProfileSkeleton />;

    return (
        <>
            <ProfileIdentityCard profile={user.profile} />
            <ProfileScoreCard skills={stats.skills} history={getScoreTrend(stats)} averageGain={getAverageGain(stats)} />
            <PartScoreCard parts={stats.parts} />
        </>
    );
}
