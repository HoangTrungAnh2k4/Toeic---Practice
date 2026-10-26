import { useCallback, useEffect, useRef, useState } from 'react';
import { readTable, writeTable } from '@/lib/data/local-store';
import {
    linkPlanTask,
    resumeOrStartAttempt,
    saveResponse,
    scoreWritingAttempt,
    updateAttempt,
} from '@/lib/data/user-data';
import type { Attempt, AttemptMode, Question } from '@/lib/domain/types';
import { SaveStatus } from '../types';

const AUTOSAVE_DELAY_MS = 600;

interface UseWritingAttemptOptions {
    examId: string;
    /** `null` = thi cả đề trong một lượt làm; có id = luyện lẻ Part đó. */
    partTemplateId: number | null;
    mode: AttemptMode;
    /** Thời lượng luyện lẻ một Part (khách); cả đề và chế độ có hướng dẫn truyền `null`, khớp `ends_at` của DB. */
    durationSec: number | null;
    /** Mọi câu trong phạm vi lượt làm, theo thứ tự Part; `answers` đánh index theo mảng này. */
    questions: Question[];
    partCount: number;
}

/** Part đang làm của lượt cả đề và lúc bắt đầu Part đó (ms): đồng hồ từng Part tính từ đây. */
interface PartProgress {
    partIndex: number;
    startedAt: number;
}

interface Draft {
    attempt_id: string;
    question_id: string;
    text: string;
}

const DRAFTS = 'writing-drafts';
/**
 * shortcut: tiến độ Part của lượt cả đề chỉ lưu localStorage; đổi máy/xoá storage giữa bài thì quay về Part 1 (Part hết
 * giờ tự nộp để đi tiếp). Cần cột trên `attempts` nếu muốn tiếp tục đúng Part trên máy khác.
 */
const PROGRESS = 'writing-progress';

interface ProgressRow {
    attempt_id: string;
    part_index: number;
    started_at: number;
}

function saveProgress(attemptId: string, progress: PartProgress | null) {
    const rows = readTable<ProgressRow>(PROGRESS).filter((row) => row.attempt_id !== attemptId);
    const next = progress ? [...rows, { attempt_id: attemptId, part_index: progress.partIndex, started_at: progress.startedAt }] : rows;
    try {
        writeTable(PROGRESS, next);
    } catch {
        // Mất tiến độ chỉ làm lần vào sau bắt đầu lại từ Part 1; câu trả lời vẫn nằm trên server/nháp
    }
}

function writeDrafts(rows: Draft[]) {
    try {
        writeTable(DRAFTS, rows);
    } catch {
        // Nháp chỉ là lớp dự phòng; lỗi lưu thật vẫn hiện qua saveStatus
    }
}

/**
 * Bản nháp trên localStorage của câu chưa chắc đã lưu lên server: ghi đồng bộ mỗi lần gõ nên đóng tab ngay cũng
 * không mất chữ, lần vào sau khôi phục từ đây.
 */
function saveDraft(draft: Draft) {
    const rows = readTable<Draft>(DRAFTS).filter(
        (row) => row.attempt_id !== draft.attempt_id || row.question_id !== draft.question_id,
    );
    writeDrafts([...rows, draft]);
}

/** Xoá nháp của lượt làm; có `saved` thì chỉ xoá nháp của câu đó nếu nội dung trùng bản vừa lưu (chưa gõ thêm). */
function clearDrafts(attemptId: string, saved?: Omit<Draft, 'attempt_id'>) {
    const rows = readTable<Draft>(DRAFTS);
    const remaining = rows.filter(
        (row) =>
            row.attempt_id !== attemptId ||
            (saved !== undefined && (row.question_id !== saved.question_id || row.text !== saved.text)),
    );
    if (remaining.length !== rows.length) writeDrafts(remaining);
}

/** Lượt làm dở của đúng đề & phạm vi (hoặc lượt mới) kèm câu trả lời đã lưu; nháp chưa kịp lưu được ưu tiên. */
async function resumeOrStart({ examId, partTemplateId, mode, durationSec, questions, partCount }: UseWritingAttemptOptions) {
    const { attempt, responses, isRestored } = await resumeOrStartAttempt({
        exam_id: examId,
        part_template_id: partTemplateId,
        mode,
        duration_sec: mode === 'guided' ? null : durationSec,
    });
    const saved = readTable<ProgressRow>(PROGRESS).find((row) => row.attempt_id === attempt.id);
    const progress: PartProgress =
        saved && saved.part_index < partCount
            ? { partIndex: saved.part_index, startedAt: saved.started_at }
            : { partIndex: 0, startedAt: Date.parse(attempt.started_at) };
    const drafts = readTable<Draft>(DRAFTS).filter((row) => row.attempt_id === attempt.id);
    // Nháp còn lại nghĩa là lần trước chưa kịp lưu lên server → dùng nháp và đưa vào hàng chờ lưu
    const unsaved = new Map<number, string>();
    const answers = questions.map((question, index) => {
        const draft = drafts.find((row) => row.question_id === question.id);
        if (draft) unsaved.set(index, draft.text);
        return draft?.text ?? responses.find((response) => response.question_id === question.id)?.text_answer ?? '';
    });
    return { attempt, answers, unsaved, isRestored, progress };
}

/**
 * Lượt làm Writing (cả đề hoặc một Part): tạo hoặc tiếp tục attempt, tự lưu từng câu vào `responses`.
 * Đồng hồ chạy theo mốc bắt đầu Part (`partStartedAt`) đã lưu nên tải lại trang không reset thời gian.
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
    const [progress, setProgress] = useState<PartProgress>({ partIndex: 0, startedAt: 0 });
    const optionsRef = useRef(options);
    /** Câu chưa kịp lưu (đang chờ debounce), theo index câu. */
    const pendingRef = useRef(new Map<number, string>());
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    /** Các lượt lưu đang chạy; nộp bài phải chờ hết, không thì RLS chặn câu tới sau khi attempt đã `submitted`. */
    const savingRef = useRef(Promise.resolve(true));

    useEffect(() => {
        let cancelled = false;
        resumeOrStart(optionsRef.current)
            .then((result) => {
                if (cancelled) return;
                setAttempt(result.attempt);
                setAnswers(result.answers);
                pendingRef.current = new Map(result.unsaved);
                setIsRestored(result.isRestored);
                setProgress(result.progress);
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

        // Lưu lúc đóng tab có thể bị huỷ giữa chừng; chữ vẫn còn trong nháp localStorage để lần sau khôi phục
        const batch = [...pendingRef.current].map(([index, text]) =>
            saveResponse(attempt.id, questions[index].id, { text_answer: text }).then(
                () => {
                    clearDrafts(attempt.id, { question_id: questions[index].id, text });
                    return true;
                },
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
        if (attempt) saveDraft({ attempt_id: attempt.id, question_id: questions[index].id, text: value });

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

    /**
     * Nộp Part đang làm sau khi lưu nốt phần đang chờ. Còn Part kế (lượt cả đề) → `'next'`, đồng hồ Part kế tính từ lúc
     * này. Part cuối → đóng lượt làm rồi gửi chấm chạy nền (không chờ) → `'done'`. `false` khi chưa lưu/nộp được.
     */
    const finishPart = async (): Promise<'next' | 'done' | false> => {
        if (!attempt) return false;
        // Câu lưu lỗi đã quay lại hàng chờ → còn câu chờ nghĩa là chưa lưu đủ
        if (!(await flush()) || pendingRef.current.size > 0) return false;
        if (progress.partIndex < options.partCount - 1) {
            const next = { partIndex: progress.partIndex + 1, startedAt: Date.now() };
            saveProgress(attempt.id, next);
            setProgress(next);
            return 'next';
        }
        try {
            await updateAttempt(attempt.id, { status: 'submitted', submitted_at: new Date().toISOString() });
            clearDrafts(attempt.id);
            saveProgress(attempt.id, null);
            // Chấm lỗi/mất mạng: attempt giữ `submitted`, trang xem bài cho chấm lại
            scoreWritingAttempt(attempt, questions).catch(() => undefined);
            // Lỗi gắn task lộ trình không chặn việc nộp
            linkPlanTask(attempt).catch(() => undefined);
            return 'done';
        } catch {
            setSaveStatus('error');
            return false;
        }
    };

    return {
        attempt,
        answers,
        partIndex: progress.partIndex,
        partStartedAt: progress.startedAt,
        isRestored,
        loadError,
        retryLoad,
        saveStatus,
        savedAt,
        updateAnswer,
        finishPart,
    };
}
