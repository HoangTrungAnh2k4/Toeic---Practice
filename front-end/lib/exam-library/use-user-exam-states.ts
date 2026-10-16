'use client';

import { useCallback, useEffect, useState } from 'react';
import { listAttempts, listBookmarkedExamIds, listResponses, toggleBookmark } from '@/lib/data/user-data';
import { buildUserStates } from './entries';
import type { UserExamState } from './types';

async function loadStates(examIds: Set<string>) {
    const [attempts, bookmarkedIds] = await Promise.all([listAttempts(), listBookmarkedExamIds()]);
    const own = attempts.filter((attempt) => examIds.has(attempt.exam_id));
    const answered = new Map<string, number>();

    await Promise.all(
        own
            .filter((attempt) => attempt.status === 'in_progress')
            .map(async (attempt) => {
                const responses = await listResponses(attempt.id);
                answered.set(
                    attempt.id,
                    responses.filter((response) => response.text_answer?.trim() || response.audio_path).length,
                );
            }),
    );
    return buildUserStates(own, bookmarkedIds, answered);
}

/**
 * Trạng thái của người dùng với từng đề (đang làm, đã làm, đánh dấu).
 * Dữ liệu khách nằm trong localStorage nên chỉ đọc được sau khi mount; `states` là `null` khi đang tải.
 */
export function useUserExamStates(examIds: string[]) {
    const [states, setStates] = useState<Map<string, UserExamState> | null>(null);
    const key = examIds.join(',');

    const reload = useCallback(() => {
        loadStates(new Set(key.split(','))).then(setStates);
    }, [key]);

    useEffect(reload, [reload]);

    const toggle = useCallback(
        async (examId: string) => {
            try {
                await toggleBookmark(examId);
            } catch {
                // Lỗi mạng hoặc bộ nhớ trình duyệt bị chặn: bỏ qua, lần nạp lại bên dưới đưa nút về trạng thái thật
            }
            reload();
        },
        [reload],
    );

    return { states, toggleBookmark: toggle };
}
