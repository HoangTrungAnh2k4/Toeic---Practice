'use client';

import { useEffect, useState } from 'react';
import { loadUserStats, UserStats } from '@/lib/data/user-stats';
import type { Exam } from '@/lib/domain/types';

/** Bài làm của khách nằm trong localStorage nên chỉ tính được sau khi mount; `null` khi đang tải. */
export function useUserStats(exams: Exam[]) {
    const [stats, setStats] = useState<UserStats | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadUserStats(exams).then((result) => !cancelled && setStats(result));
        return () => {
            cancelled = true;
        };
    }, [exams]);

    return stats;
}
