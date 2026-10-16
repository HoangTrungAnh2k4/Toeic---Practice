'use client';

import { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { listAttempts, listBookmarkedExamIds, listResponses, toggleBookmark } from '@/lib/data/user-data';
import { buildUserStates, withBookmark } from './entries';
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
 * Dữ liệu khách nằm trong localStorage nên chỉ đọc được sau khi mount; `states` là `null` khi đang tải hoặc tải lỗi.
 */
function useExamStatesSource(examIds: string[]) {
    const [states, setStates] = useState<Map<string, UserExamState> | null>(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [bookmarkFailed, setBookmarkFailed] = useState(false);
    // Lượt tải mới nhất; kết quả của lượt cũ về muộn thì bỏ
    const requestRef = useRef(0);
    // Đề đang chờ lưu đánh dấu: bấm lại khi chưa xong thì bỏ qua
    const pendingRef = useRef(new Set<string>());
    const key = examIds.join(',');

    const reload = useCallback(() => {
        const request = ++requestRef.current;
        loadStates(new Set(key.split(','))).then(
            (next) => {
                if (request !== requestRef.current) return;
                setStates(next);
                setLoadFailed(false);
            },
            () => {
                if (request === requestRef.current) setLoadFailed(true);
            },
        );
    }, [key]);

    useEffect(reload, [reload]);

    const retry = useCallback(() => {
        setLoadFailed(false);
        reload();
    }, [reload]);

    const toggle = useCallback(
        async (examId: string) => {
            if (!states || pendingRef.current.has(examId)) return;
            const wanted = !(states.get(examId)?.bookmarked ?? false);

            pendingRef.current.add(examId);
            setBookmarkFailed(false);
            setStates((prev) => prev && withBookmark(prev, examId, wanted));
            try {
                // Lấy kết quả thật từ nguồn dữ liệu: có thể khác `wanted` nếu tab khác vừa đổi
                const saved = await toggleBookmark(examId);
                setStates((prev) => prev && withBookmark(prev, examId, saved));
            } catch {
                setStates((prev) => prev && withBookmark(prev, examId, !wanted));
                setBookmarkFailed(true);
            } finally {
                pendingRef.current.delete(examId);
            }
        },
        [states],
    );

    return { states, loadFailed, retry, bookmarkFailed, toggleBookmark: toggle };
}

type UserExamStates = ReturnType<typeof useExamStatesSource>;

const UserExamStatesContext = createContext<UserExamStates | null>(null);

/** Một lượt tải cho cả trang thư viện đề: hero, thẻ KPI, danh sách đề dùng chung, Thử lại làm mới tất cả. */
export function UserExamStatesProvider({ examIds, children }: { examIds: string[]; children: ReactNode }) {
    return <UserExamStatesContext value={useExamStatesSource(examIds)}>{children}</UserExamStatesContext>;
}

export function useUserExamStates() {
    const value = useContext(UserExamStatesContext);
    if (!value) throw new Error('useUserExamStates phải nằm trong UserExamStatesProvider.');
    return value;
}
