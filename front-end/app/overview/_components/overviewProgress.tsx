'use client';

import { getTopMistake } from '@/app/mistakes/_lib/data';
import { useMistakeBook } from '@/app/mistakes/_lib/useMistakeBook';
import { LoadError } from '@/components/load-error';
import { Skeleton } from '@/components/ui/skeleton';
import { combineAsync, useAsync } from '@/hooks/use-async';
import { useUserStats } from '@/hooks/use-user-stats';
import { getProfile } from '@/lib/data/user-data';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { Chart } from './chart';
import SkillGoals from './skillGoal';

interface OverviewProgressProps {
    exams: ExamSummary[];
    patterns: MistakePattern[];
}

/** Bọc lại vì `getProfile` trả `null` cho khách, trùng với `null` = đang tải của `useAsync`. */
const loadUser = async () => ({ profile: await getProfile() });

/** Điểm, mục tiêu và số lượt theo Part — đọc bài làm trong localStorage nên render sau khi mount. */
export default function OverviewProgress({ exams, patterns }: OverviewProgressProps) {
    const statsState = useUserStats(exams);
    const bookState = useMistakeBook(patterns, exams);
    const userState = useAsync(loadUser);
    const { failed, retry } = combineAsync(statsState, bookState, userState);
    const { data: stats } = statsState;
    const { data: book } = bookState;
    const { data: user } = userState;

    if (failed) return <LoadError message="Không tải được tiến độ học." onRetry={retry} />;
    if (!stats || !book || !user) {
        return (
            <div className="flex lg:flex-row flex-col gap-4" aria-busy="true" aria-label="Đang tải tiến độ">
                <Skeleton className="flex-1 rounded-xl h-80" />
                <Skeleton className="lg:w-2/5 rounded-xl h-80" />
            </div>
        );
    }
    const { profile } = user;

    return (
        <div className="flex lg:flex-row flex-col gap-4">
            <SkillGoals
                stats={stats}
                targets={{ speaking: profile?.target_speaking ?? null, writing: profile?.target_writing ?? null }}
                isGuest={!profile}
                focus={{ speaking: getTopMistake(book, 'speaking'), writing: getTopMistake(book, 'writing') }}
            />
            <Chart parts={stats.parts} />
        </div>
    );
}
