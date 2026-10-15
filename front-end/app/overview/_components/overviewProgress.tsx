'use client';

import { useEffect, useState } from 'react';
import { getTopMistake } from '@/app/mistakes/_lib/data';
import { useMistakeBook } from '@/app/mistakes/_lib/useMistakeBook';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserStats } from '@/hooks/use-user-stats';
import { getProfile } from '@/lib/data/user-data';
import type { MistakePattern, Profile } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { Chart } from './chart';
import SkillGoals from './skillGoal';

interface OverviewProgressProps {
    exams: ExamSummary[];
    patterns: MistakePattern[];
}

/** Điểm, mục tiêu và số lượt theo Part — đọc bài làm trong localStorage nên render sau khi mount. */
export default function OverviewProgress({ exams, patterns }: OverviewProgressProps) {
    const stats = useUserStats(exams);
    const book = useMistakeBook(patterns, exams);
    const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

    useEffect(() => {
        getProfile().then(setProfile);
    }, []);

    if (!stats || !book || profile === undefined) {
        return (
            <div className="flex lg:flex-row flex-col gap-4" aria-busy="true" aria-label="Đang tải tiến độ">
                <Skeleton className="flex-1 rounded-xl h-80" />
                <Skeleton className="lg:w-2/5 rounded-xl h-80" />
            </div>
        );
    }

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
