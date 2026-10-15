'use client';

import { useEffect, useState } from 'react';
import type { ExamSummary } from '@/lib/exam-library/types';
import type { HistoryRow } from '../types';
import { loadHistoryRows } from './data';

/** Lượt làm của khách nằm trong localStorage nên chỉ đọc được sau khi mount; `null` khi đang tải. */
export function useHistoryRows(exams: ExamSummary[]) {
    const [rows, setRows] = useState<HistoryRow[] | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadHistoryRows(exams).then((result) => !cancelled && setRows(result));
        return () => {
            cancelled = true;
        };
    }, [exams]);

    return rows;
}
