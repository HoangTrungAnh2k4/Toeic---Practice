'use client';

import { useEffect, useState } from 'react';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { buildMistakeBook, loadMistakeBookInput, MistakeBook } from './data';

/** Bài làm của khách nằm trong localStorage nên sổ lỗi chỉ tính được sau khi mount; `null` khi đang tải. */
export function useMistakeBook(patterns: MistakePattern[], exams: ExamSummary[]) {
    const [book, setBook] = useState<MistakeBook | null>(null);

    useEffect(() => {
        let cancelled = false;
        loadMistakeBookInput(exams).then((input) => !cancelled && setBook(buildMistakeBook(patterns, input)));
        return () => {
            cancelled = true;
        };
    }, [patterns, exams]);

    return book;
}
