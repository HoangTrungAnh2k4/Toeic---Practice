'use client';

import { useCallback } from 'react';
import { useAsync } from '@/hooks/use-async';
import type { ExamSummary } from '@/lib/exam-library/types';
import { loadHistoryRows } from './data';

/** Các lượt làm của người dùng; `data` là `null` khi đang tải. */
export function useHistoryRows(exams: ExamSummary[]) {
    return useAsync(useCallback(() => loadHistoryRows(exams), [exams]));
}
