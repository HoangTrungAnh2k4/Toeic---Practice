import { useRef, useState } from 'react';

const HISTORY_LIMIT = 100;
/** Các lần gõ liên tiếp trong khoảng này được gộp thành một bước Undo. */
const TYPING_BURST_MS = 800;

/** Undo/Redo (Ctrl+Z / Ctrl+Y) tự quản lý cho textarea controlled. */
export function useTextHistory(value: string, onChange: (next: string) => void) {
    const [past, setPast] = useState<string[]>([]);
    const [future, setFuture] = useState<string[]>([]);
    const lastTypingAtRef = useRef(0);
    const lastWasDeletionRef = useRef(false);

    const commit = (next: string, { isTyping = false } = {}) => {
        if (next === value) return;

        const now = Date.now();
        const isDeletion = next.length < value.length;
        // Tách bước Undo mới khi: gõ xong một từ, hoặc chuyển giữa gõ và xóa
        const completesWord = /\s$/.test(next) && !/\s$/.test(value);
        const isSameBurst =
            isTyping &&
            !completesWord &&
            isDeletion === lastWasDeletionRef.current &&
            now - lastTypingAtRef.current < TYPING_BURST_MS;
        if (!isSameBurst) setPast((prev) => [...prev.slice(-(HISTORY_LIMIT - 1)), value]);

        lastTypingAtRef.current = isTyping ? now : 0;
        lastWasDeletionRef.current = isDeletion;
        setFuture([]);
        onChange(next);
    };

    const undo = () => {
        const previous = past.at(-1);
        if (previous === undefined) return;
        setPast((prev) => prev.slice(0, -1));
        setFuture((prev) => [value, ...prev]);
        lastTypingAtRef.current = 0;
        onChange(previous);
    };

    const redo = () => {
        const [next, ...rest] = future;
        if (next === undefined) return;
        setFuture(rest);
        setPast((prev) => [...prev, value]);
        lastTypingAtRef.current = 0;
        onChange(next);
    };

    return { commit, undo, redo };
}
