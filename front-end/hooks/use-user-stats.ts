'use client';

import { useCallback } from 'react';
import { useAsync } from '@/hooks/use-async';
import { loadUserStats } from '@/lib/data/user-stats';
import type { Exam } from '@/lib/domain/types';

/** Thống kê bài làm của người dùng; `data` là `null` khi đang tải. */
export function useUserStats(exams: Exam[]) {
    return useAsync(useCallback(() => loadUserStats(exams), [exams]));
}
