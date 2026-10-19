'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toWav16k } from '@/lib/audio/wav';
import {
    finalizeSpeakingAttempt,
    resumeOrStartAttempt,
    scoreSpeakingAnswer,
    ScoringLimitError,
    updateAttempt,
} from '@/lib/data/user-data';
import type { Attempt, AttemptMode } from '@/lib/domain/types';
import type { ScoredQuestion } from '@/lib/scoring/scale';

interface PendingAnswer {
    audio: Blob;
    partNo: number;
}

/** `limit`: hết lượt chấm trong ngày, bài vẫn được nộp với các câu đã chấm. */
export type SubmitResult = 'ok' | 'limit' | 'error';

/**
 * Lượt thi Speaking: làm tiếp lượt dở của đề (câu đã chấm được bỏ qua) hoặc tạo lượt mới; gửi bài nói từng câu đi chấm
 * ngay khi chốt (chạy nền, audio chỉ nằm trên RAM). Nộp bài: chờ các câu đang chấm, thử lại câu lỗi rồi tính tổng điểm.
 * Rời phòng khi câu chưa chấm xong thì mất audio câu đó, lần vào sau làm lại từ câu đó.
 */
export function useSpeakingAttempt(examId: string, mode: AttemptMode, questions: ScoredQuestion[]) {
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    /** Câu đã được chấm ở lần vào phòng trước. */
    const [answeredIds, setAnsweredIds] = useState<ReadonlySet<string>>(new Set());
    const [loadError, setLoadError] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    /** Câu chưa chấm xong; giữ audio để nộp bài thử lại khi lỗi mạng. */
    const pendingRef = useRef(new Map<string, PendingAnswer>());
    const tasksRef = useRef(new Map<string, Promise<void>>());
    const limitedRef = useRef(false);

    useEffect(() => {
        let cancelled = false;
        resumeOrStartAttempt({ exam_id: examId, part_template_id: null, mode, duration_sec: null })
            .then((result) => {
                if (cancelled) return;
                setAttempt(result.attempt);
                // Khâu chấm chỉ ghi `responses` khi chấm xong nên có dòng là câu đã có điểm
                setAnsweredIds(new Set(result.responses.map((response) => response.question_id)));
            })
            .catch(() => !cancelled && setLoadError(true));
        return () => {
            cancelled = true;
        };
    }, [examId, mode, loadCount]);

    const retryLoad = useCallback(() => {
        setLoadError(false);
        setLoadCount((n) => n + 1);
    }, []);

    const scoreAudio = useCallback(
        (questionId: string, audio: Blob, partNo: number) => {
            if (!attempt) return;
            const answer = { audio, partNo };
            pendingRef.current.set(questionId, answer);
            const task = Promise.resolve(partNo === 1 ? toWav16k(audio) : audio)
                .then((upload) => scoreSpeakingAnswer(attempt.id, questionId, upload))
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
        [attempt],
    );

    const submit = async (): Promise<SubmitResult> => {
        if (!attempt) return 'error';
        await Promise.all(tasksRef.current.values());
        for (const [questionId, { audio, partNo }] of pendingRef.current) scoreAudio(questionId, audio, partNo);
        await Promise.all(tasksRef.current.values());
        if (pendingRef.current.size > 0) return 'error';

        try {
            await finalizeSpeakingAttempt(attempt.id, questions);
            return limitedRef.current ? 'limit' : 'ok';
        } catch {
            return 'error';
        }
    };

    /** Thoát giữa chừng: đánh dấu `interrupted` để lịch sử hiện "Bị gián đoạn"; lần vào sau vẫn làm tiếp được. */
    const leave = async () => {
        if (!attempt) return;
        // Lỗi thì lượt làm giữ `in_progress`, vẫn làm tiếp được nên không chặn việc thoát
        await updateAttempt(attempt.id, { status: 'interrupted' }).catch(() => undefined);
    };

    return { attempt, answeredIds, loadError, retryLoad, scoreAudio, submit, leave };
}
