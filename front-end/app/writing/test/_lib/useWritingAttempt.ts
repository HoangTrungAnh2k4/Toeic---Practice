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
 * Lượt làm Writing: tạo hoặc tiếp tục attempt, tự lưu từng câu vào `responses`.
 * Đồng hồ chạy theo `attempt.ends_at` nên tải lại trang không reset thời gian.
 */
export function useWritingAttempt(options: UseWritingAttemptOptions) {
    const { questions } = options;
    const [attempt, setAttempt] = useState<Attempt | null>(null);
    const [answers, setAnswers] = useState<string[]>([]);
    const [isRestored, setIsRestored] = useState(false);
    const [loadError, setLoadError] = useState(false);
    const [loadCount, setLoadCount] = useState(0);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const optionsRef = useRef(options);
    /** Câu chưa kịp lưu (đang chờ debounce), theo index câu. */
    const pendingRef = useRef(new Map<number, string>());
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    /** Các lượt lưu đang chạy; nộp bài phải chờ hết, không thì RLS chặn câu tới sau khi attempt đã `submitted`. */
    const savingRef = useRef(Promise.resolve(true));

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
    }, [loadCount]);

    const retryLoad = useCallback(() => {
        setLoadError(false);
        setLoadCount((n) => n + 1);
    }, []);

    /**
     * Ghi ngay mọi câu đang chờ; trả `true` khi mọi lượt lưu (cả lượt trước còn đang chạy) đều thành công.
     * Câu lưu lỗi quay lại hàng chờ (nếu chưa có bản mới hơn) để lần flush sau thử lại.
     */
    const flush = useCallback(() => {
        clearTimeout(timeoutRef.current);
        if (!attempt) return savingRef.current;

        // shortcut: lưu lên Supabase lúc đóng tab có thể bị huỷ giữa chừng (mất phần gõ trong ~600ms cuối);
        // thêm fetch keepalive hoặc bản nháp localStorage nếu người dùng báo mất chữ.
        const batch = [...pendingRef.current].map(([index, text]) =>
            saveResponse(attempt.id, questions[index].id, { text_answer: text }).then(
                () => true,
                () => {
                    if (!pendingRef.current.has(index)) pendingRef.current.set(index, text);
                    setSaveStatus('error');
                    return false;
                },
            ),
        );
        pendingRef.current.clear();
        savingRef.current = Promise.all([savingRef.current, ...batch]).then((results) => results.every(Boolean));
        return savingRef.current;
    }, [attempt, questions]);

    useEffect(() => {
        const onPageHide = () => void flush();
        window.addEventListener('pagehide', onPageHide);
        return () => {
            window.removeEventListener('pagehide', onPageHide);
            void flush();
        };
    }, [flush]);

    const updateAnswer = (index: number, value: string) => {
        setAnswers((prev) => prev.map((answer, i) => (i === index ? value : answer)));
        setSaveStatus('saving');
        pendingRef.current.set(index, value);

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            void flush().then((ok) => {
                // Đã gõ tiếp trong lúc lưu → vẫn là `saving`
                if (!ok || pendingRef.current.size > 0) return;
                setSaveStatus('saved');
                setSavedAt(Date.now());
            });
        }, AUTOSAVE_DELAY_MS);
    };

    /** Nộp bài: lưu nốt phần đang chờ rồi đóng lượt làm. Trả `false` (trạng thái `error`) khi chưa lưu/nộp được. */
    const submit = async () => {
        if (!attempt) return false;
        // Câu lưu lỗi đã quay lại hàng chờ → còn câu chờ nghĩa là chưa lưu đủ
        if (!(await flush()) || pendingRef.current.size > 0) return false;
        try {
            await updateAttempt(attempt.id, { status: 'submitted', submitted_at: new Date().toISOString() });
            return true;
        } catch {
            setSaveStatus('error');
            return false;
        }
    };

    return { attempt, answers, isRestored, loadError, retryLoad, saveStatus, savedAt, updateAnswer, submit };
}
