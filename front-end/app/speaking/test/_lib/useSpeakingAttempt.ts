'use client';

import { useCallback, useEffect, useRef } from 'react';
import { toWav16k } from '@/lib/audio/wav';
import { finalizeSpeakingAttempt, scoreSpeakingAnswer, ScoringLimitError, startAttempt } from '@/lib/data/user-data';
import type { Attempt, AttemptMode } from '@/lib/domain/types';
import type { ScoredQuestion } from '@/lib/scoring/scale';

interface PendingAnswer {
    audio: Blob;
    partNo: number;
}

/** `limit`: hết lượt chấm trong ngày, bài vẫn được nộp với các câu đã chấm. */
export type SubmitResult = 'ok' | 'limit' | 'error';

/**
 * Lượt thi Speaking: tạo attempt khi vào phòng, gửi bài nói từng câu đi chấm ngay khi chốt (chạy nền, audio chỉ
 * nằm trên RAM). Nộp bài: chờ các câu đang chấm, thử lại câu lỗi rồi tính tổng điểm.
 */
export function useSpeakingAttempt(examId: string, mode: AttemptMode, questions: ScoredQuestion[]) {
    // Ref giữ nguyên qua lần mount lại của StrictMode nên không tạo trùng attempt
    const attemptRef = useRef<Promise<Attempt> | null>(null);
    /** Câu chưa chấm xong; giữ audio để nộp bài thử lại khi lỗi mạng. */
    const pendingRef = useRef(new Map<string, PendingAnswer>());
    const tasksRef = useRef(new Map<string, Promise<void>>());
    const limitedRef = useRef(false);

    const getAttempt = useCallback(() => {
        attemptRef.current ??= startAttempt({
            exam_id: examId,
            part_template_id: null,
            mode,
            duration_sec: null,
        }).catch((error: unknown) => {
            attemptRef.current = null;
            throw error;
        });
        return attemptRef.current;
    }, [examId, mode]);

    useEffect(() => {
        // Tạo sớm; lỗi thì lần chấm/nộp bài sau thử lại
        getAttempt().catch(() => {});
    }, [getAttempt]);

    const scoreAudio = useCallback(
        (questionId: string, audio: Blob, partNo: number) => {
            const answer = { audio, partNo };
            pendingRef.current.set(questionId, answer);
            const task = Promise.all([getAttempt(), partNo === 1 ? toWav16k(audio) : audio])
                .then(([attempt, upload]) => scoreSpeakingAnswer(attempt.id, questionId, upload))
                .then(
                    () => {
                        if (pendingRef.current.get(questionId) === answer) pendingRef.current.delete(questionId);
                    },
                    (error: unknown) => {
                        // Hết lượt thì thử lại cũng vô ích: bỏ câu này, nộp bài vẫn tính các câu đã chấm
                        if (!(error instanceof ScoringLimitError)) return;
                        limitedRef.current = true;
                        pendingRef.current.delete(questionId);
                    },
                );
            tasksRef.current.set(questionId, task);
        },
        [getAttempt],
    );

    const submit = async (): Promise<SubmitResult> => {
        await Promise.all(tasksRef.current.values());
        for (const [questionId, { audio, partNo }] of pendingRef.current) scoreAudio(questionId, audio, partNo);
        await Promise.all(tasksRef.current.values());
        if (pendingRef.current.size > 0) return 'error';

        try {
            await finalizeSpeakingAttempt((await getAttempt()).id, questions);
            return limitedRef.current ? 'limit' : 'ok';
        } catch {
            return 'error';
        }
    };

    return { scoreAudio, submit, getAttempt };
}
