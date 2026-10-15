import { useCallback, useEffect, useRef, useState } from 'react';
import { listAttempts, listResponses, saveResponse, startAttempt, updateAttempt } from '@/lib/data/user-data';
import type { Attempt, AttemptMode, Question } from '@/lib/domain/types';
import { SaveStatus } from '../types';

const AUTOSAVE_DELAY_MS = 600;

interface UseWritingAttemptOptions {
    examId: string;
    partTemplateId: number;
    mode: AttemptMode;
    /** Thời lượng của Part; chế độ có hướng dẫn không giới hạn giờ. */
    durationSec: number | null;
    questions: Question[];
}

/** Lượt làm đang dở của đúng đề & Part này, hoặc tạo lượt mới. */
async function resumeOrStart({ examId, partTemplateId, mode, durationSec, questions }: UseWritingAttemptOptions) {
    const attempts = await listAttempts();
    const existing = attempts.find(
        (attempt) =>
            attempt.exam_id === examId && attempt.part_template_id === partTemplateId && attempt.status === 'in_progress',
    );

    if (existing) {
        const responses = await listResponses(existing.id);
        const answers = questions.map(
            (question) => responses.find((response) => response.question_id === question.id)?.text_answer ?? '',
        );
        return { attempt: existing, answers, isRestored: true };
    }

    const attempt = await startAttempt({
        exam_id: examId,
        part_template_id: partTemplateId,
        mode,
        duration_sec: mode === 'guided' ? null : durationSec,
    });
    return { attempt, answers: questions.map(() => ''), isRestored: false };
}

/** Dùng chung một lần khởi tạo cho cùng đề & Part — StrictMode chạy effect 2 lần sẽ tạo trùng attempt. */
const pendingStarts = new Map<string, ReturnType<typeof resumeOrStart>>();

function resumeOrStartOnce(options: UseWritingAttemptOptions) {
    const key = `${options.examId}:${options.partTemplateId}`;
    let promise = pendingStarts.get(key);
    if (!promise) {
        promise = resumeOrStart(options).finally(() => pendingStarts.delete(key));
        pendingStarts.set(key, promise);
    }
    return promise;
}

/**
 * Lượt làm Writing của khách: tạo hoặc tiếp tục attempt, tự lưu từng câu vào `responses`.
 * Đồng hồ chạy theo `attempt.ends_at` nên tải lại trang không reset thời gian.
 */
export function useWritingAttempt(options: UseWritingAttemptOptions) {
    const { questions } = options;
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isRestored, setIsRestored] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const optionsRef = useRef(options);
    /** Câu chưa kịp lưu (đang chờ debounce), theo index câu. */
    const pendingRef = useRef(new Map<number, string>());
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

    useEffect(() => {
        let cancelled = false;
        resumeOrStartOnce(optionsRef.current)
            .then((result) => {
                if (cancelled) return;
                setAttempt(result.attempt);
                setAnswers(result.answers);
                setIsRestored(result.isRestored);
            })
            .catch(() => !cancelled && setLoadError(true));
        return () => {
            cancelled = true;
        };
    }, []);

    /** Ghi ngay mọi câu đang chờ. Lỗi ghi (bộ nhớ trình duyệt bị chặn/đầy) chuyển trạng thái sang `error`. */
    const flush = useCallback(() => {
        clearTimeout(timeoutRef.current);
        if (!attempt) return;

        // saveResponse ghi localStorage đồng bộ trước khi trả promise → an toàn khi gọi lúc rời trang
        for (const [index, text] of pendingRef.current) {
            saveResponse(attempt.id, questions[index].id, { text_answer: text }).catch(() => setSaveStatus('error'));
        }
        pendingRef.current.clear();
    }, [attempt, questions]);

    useEffect(() => {
        window.addEventListener('pagehide', flush);
        return () => {
            window.removeEventListener('pagehide', flush);
            flush();
        };
    }, [flush]);

    const updateAnswer = (index: number, value: string) => {
        setAnswers((prev) => prev.map((answer, i) => (i === index ? value : answer)));
        setSaveStatus('saving');
        pendingRef.current.set(index, value);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            // Lỗi ghi (nếu có) báo về sau qua catch trong flush và ghi đè trạng thái này
            setSaveStatus('saved');
            setSavedAt(Date.now());
            flush();
        }, AUTOSAVE_DELAY_MS);
    };

    /** Nộp bài: lưu nốt phần đang chờ rồi đóng lượt làm. */
    const submit = async () => {
        if (!attempt) return;
        flush();
        await updateAttempt(attempt.id, { status: 'submitted', submitted_at: new Date().toISOString() });
    };

    return { attempt, answers, isRestored, loadError, saveStatus, savedAt, updateAnswer, submit };
}
