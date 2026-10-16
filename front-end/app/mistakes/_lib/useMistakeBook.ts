'use client';

import { useCallback } from 'react';
import { useAsync } from '@/hooks/use-async';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { buildMistakeBook, loadMistakeBookInput } from './data';

/** Sổ lỗi tính từ bài làm của người dùng; `data` là `null` khi đang tải. */
export function useMistakeBook(patterns: MistakePattern[], exams: ExamSummary[]) {
    return useAsync(
        useCallback(
            async () => buildMistakeBook(patterns, await loadMistakeBookInput(exams)),
            [patterns, exams],
        ),
    );
}
