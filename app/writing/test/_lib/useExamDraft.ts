import { useEffect, useRef, useState } from 'react';
import { SaveStatus, WritingDraft } from '../types';
import { clearDraft, loadDraft, PICTURE_QUESTIONS, saveDraft, SECTION_DURATION_SECONDS } from '../utils';

const AUTOSAVE_DELAY_MS = 600;

function createInitialDraft(): { draft: WritingDraft; isRestored: boolean } {
    const saved = loadDraft();
    if (saved && saved.endsAt > Date.now() && saved.answers.length === PICTURE_QUESTIONS.length) {
        return { draft: saved, isRestored: true };
    }
    return {
        draft: {
            answers: PICTURE_QUESTIONS.map(() => ''),
            endsAt: Date.now() + SECTION_DURATION_SECONDS * 1000,
        },
        isRestored: false,
    };
}

/**
 * Quản lý câu trả lời của nhóm Q1-5 + tự động lưu nháp vào localStorage.
 * Chỉ dùng trong component render phía client (ssr: false) vì đọc storage ngay khi khởi tạo.
 */
export function useExamDraft() {
    const [initial] = useState(createInitialDraft);
    const [answers, setAnswers] = useState(initial.draft.answers);
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [savedAt, setSavedAt] = useState<number | null>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);
    /** Bản nháp chưa kịp ghi (đang chờ debounce). */
    const pendingDraftRef = useRef<WritingDraft | null>(null);
    const { endsAt } = initial.draft;

    useEffect(() => {
        // Lưu mốc hết giờ ngay từ đầu để tải lại trang không reset đồng hồ
        saveDraft(initial.draft);

        // Ghi ngay phần chưa lưu khi tải lại / đóng tab / rời trang để không mất chữ vừa gõ
        const flushPending = () => {
            clearTimeout(timeoutRef.current);
            if (pendingDraftRef.current) saveDraft(pendingDraftRef.current);
            pendingDraftRef.current = null;
        };

        window.addEventListener('pagehide', flushPending);
        return () => {
            window.removeEventListener('pagehide', flushPending);
            flushPending();
        };
    }, [initial]);

    const updateAnswer = (index: number, value: string) => {
        const next = answers.map((answer, i) => (i === index ? value : answer));
        setAnswers(next);
        setSaveStatus('saving');
        pendingDraftRef.current = { answers: next, endsAt };

        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            pendingDraftRef.current = null;
            setSaveStatus(saveDraft({ answers: next, endsAt }) ? 'saved' : 'error');
            setSavedAt(Date.now());
        }, AUTOSAVE_DELAY_MS);
    };

    const discardDraft = () => {
        clearTimeout(timeoutRef.current);
        pendingDraftRef.current = null;
        clearDraft();
    };

    return { answers, endsAt, updateAnswer, saveStatus, savedAt, isRestored: initial.isRestored, discardDraft };
}
