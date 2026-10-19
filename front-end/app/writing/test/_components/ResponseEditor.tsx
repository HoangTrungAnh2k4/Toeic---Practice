'use client';

import { KeyboardEvent, useRef, useState } from 'react';
import type { IconType } from 'react-icons';
import {
    LuCircleCheck,
    LuCircleX,
    LuClipboardPaste,
    LuCopy,
    LuInfo,
    LuRedo2,
    LuScissors,
    LuTriangleAlert,
    LuUndo2,
} from 'react-icons/lu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTextHistory } from '../_lib/useTextHistory';
import { KeywordStatus, RequiredKeyword } from '../types';
import { countSentences, countWords, ESSAY_MIN_WORDS, OPTIMAL_WORD_RANGE } from '../utils';

interface ResponseEditorProps {
    /** Part 1 viết một câu với từ khóa bắt buộc; Part 3 là bài luận có mục tiêu số từ; Part 2 là đoạn văn tự do. */
    partNo: number;
    questionNumber: number;
    value: string;
    onChange: (value: string) => void;
    keywords: RequiredKeyword[];
    keywordUsages: (string | null)[];
    isLocked: boolean;
}

interface ToolbarButtonProps {
    icon: IconType;
    label: string;
    shortcut?: string;
    disabled?: boolean;
    onClick: () => void;
}

const KEYWORD_STATUS_STYLE: Record<KeywordStatus, { Icon: IconType; className: string }> = {
    complete: { Icon: LuCircleCheck, className: 'bg-main text-sub3' },
    partial: { Icon: LuInfo, className: 'bg-sub3/20 text-main' },
    none: { Icon: LuCircleX, className: 'bg-destructive/10 text-destructive' },
};

function ToolbarButton({ icon: Icon, label, shortcut, disabled, onClick }: ToolbarButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={shortcut ? `${label} (${shortcut})` : label}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-sub1 disabled:opacity-50 px-2.5 border border-sub2/30 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 h-8 font-semibold text-main text-xs transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
            <Icon className="size-4" aria-hidden="true" />
            <span className="hidden sm:inline">{label}</span>
        </button>
    );
}

export default function ResponseEditor({
    partNo,
    questionNumber,
    value,
    onChange,
    keywords,
    keywordUsages,
    isLocked,
}: ResponseEditorProps) {
    const isSentence = partNo === 1;
    const isEssay = partNo === 3;
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [notice, setNotice] = useState<string | null>(null);
    const { commit, undo, redo, canUndo, canRedo } = useTextHistory(value, onChange);

    const usedCount = keywordUsages.filter(Boolean).length;
    const keywordStatus: KeywordStatus =
        usedCount === keywords.length ? 'complete' : usedCount > 0 ? 'partial' : 'none';
    const { Icon: StatusIcon, className: statusClass } = KEYWORD_STATUS_STYLE[keywordStatus];

    const wordCount = countWords(value);
    const sentenceCount = countSentences(value);
    const isWordCountOptimal = wordCount >= OPTIMAL_WORD_RANGE.min && wordCount <= OPTIMAL_WORD_RANGE.max;
    const isEssayLengthMet = wordCount >= ESSAY_MIN_WORDS;

    const getSelection = () => {
        const el = textareaRef.current;
        return el ? { start: el.selectionStart, end: el.selectionEnd } : { start: value.length, end: value.length };
    };

    const replaceSelection = (text: string, start: number, end: number) => {
        commit(value.slice(0, start) + text + value.slice(end));
        const caret = start + text.length;
        requestAnimationFrame(() => {
            textareaRef.current?.focus();
            textareaRef.current?.setSelectionRange(caret, caret);
        });
    };

    const copySelection = async ({ removeAfter = false } = {}) => {
        const { start, end } = getSelection();
        if (start === end) {
            setNotice('Hãy bôi đen đoạn văn bản cần sao chép.');
            return;
        }
        try {
            await navigator.clipboard.writeText(value.slice(start, end));
            setNotice(null);
            if (removeAfter) replaceSelection('', start, end);
        } catch {
            setNotice('Trình duyệt chặn quyền clipboard, hãy dùng Ctrl+C / Ctrl+X.');
        }
    };

    const paste = async () => {
        const { start, end } = getSelection();
        try {
            const text = await navigator.clipboard.readText();
            setNotice(null);
            if (text) replaceSelection(text, start, end);
        } catch {
            setNotice('Trình duyệt chặn quyền dán, hãy dùng Ctrl+V.');
        }
    };

    // Giữ focus trong ô trả lời sau khi bấm nút để tiếp tục gõ / dùng phím tắt
    const withFocus = (action: () => void) => {
        action();
        textareaRef.current?.focus();
    };

    // Ctrl+Z / Ctrl+Y dùng lịch sử riêng để đồng bộ với nút Undo/Redo
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (!(e.ctrlKey || e.metaKey)) return;
        const key = e.key.toLowerCase();
        if (key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undo();
        } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
            e.preventDefault();
            redo();
        }
    };

    const textareaId = `response-q${questionNumber}`;

    return (
        <section aria-label="Khung trả lời" className="flex flex-col bg-white shadow-sm border border-sub2/30 rounded-xl overflow-hidden">
            {/* ETS-style toolbar */}
            <div
                role="toolbar"
                aria-label="Công cụ soạn thảo"
                className="flex flex-wrap justify-between items-center gap-2 bg-sub1/60 px-4 py-2 border-sub2/20 border-b"
            >
                <div className="flex flex-wrap items-center gap-1.5">
                    <ToolbarButton icon={LuScissors} label="Cut" disabled={isLocked} onClick={() => copySelection({ removeAfter: true })} />
                    <ToolbarButton icon={LuCopy} label="Copy" onClick={() => copySelection()} />
                    <ToolbarButton icon={LuClipboardPaste} label="Paste" disabled={isLocked} onClick={paste} />
                    <span className="bg-sub2/40 mx-1 w-px h-5" aria-hidden="true" />
                    <ToolbarButton icon={LuUndo2} label="Undo" shortcut="Ctrl+Z" disabled={isLocked || !canUndo} onClick={() => withFocus(undo)} />
                    <ToolbarButton icon={LuRedo2} label="Redo" shortcut="Ctrl+Y" disabled={isLocked || !canRedo} onClick={() => withFocus(redo)} />
                </div>
                {isSentence && (
                    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[11px]', statusClass)}>
                        <StatusIcon className="size-3.5" aria-hidden="true" />
                        {usedCount}/{keywords.length} từ khóa
                    </span>
                )}
            </div>

            {/* Response area */}
            <div className="flex flex-col gap-3 p-4 sm:p-5">
                <label htmlFor={textareaId} className="font-semibold text-subText text-xs uppercase tracking-wider">
                    {isSentence ? 'Your Response — một câu hoàn chỉnh' : 'Your Response'}
                </label>
                <Textarea
                    ref={textareaRef}
                    id={textareaId}
                    value={value}
                    onChange={(e) => commit(e.target.value, { isTyping: true })}
                    onKeyDown={handleKeyDown}
                    readOnly={isLocked}
                    aria-readonly={isLocked}
                    spellCheck={false}
                    autoCorrect="off"
                    autoCapitalize="none"
                    autoComplete="off"
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                    className={cn(
                        'bg-white read-only:bg-sub1/40 p-4 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 text-main md:text-base text-base leading-relaxed resize-y placeholder:text-sub2',
                        isSentence ? 'min-h-48' : 'min-h-96',
                    )}
                />

                {isSentence && sentenceCount > 1 && (
                    <p className="flex items-start gap-2 bg-sub3/15 p-3 border border-sub3/50 rounded-lg text-main text-xs leading-relaxed">
                        <LuTriangleAlert className="mt-0.5 size-4 text-main shrink-0" aria-hidden="true" />
                        <span>
                            Có vẻ bạn đang viết <strong>{sentenceCount} câu</strong>. Part 1 chỉ chấm một câu duy nhất —
                            hãy nối các ý bằng liên từ (while, because, although) hoặc mệnh đề quan hệ.
                        </span>
                    </p>
                )}

                {notice && (
                    <p role="alert" className="flex items-center gap-2 text-destructive text-xs">
                        <LuInfo className="size-4 shrink-0" aria-hidden="true" />
                        {notice}
                    </p>
                )}
            </div>

            {/* Live metrics */}
            <div className="flex flex-wrap justify-between items-center gap-3 bg-sub1/60 px-4 sm:px-5 py-3 border-sub2/20 border-t text-xs">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-subText" aria-live="polite">
                    <span className="flex items-baseline gap-1.5">
                        Số từ:
                        <strong className="font-bold tabular-nums text-main text-base">{wordCount}</strong>
                        {isSentence && (
                            <span className={cn(isWordCountOptimal ? 'text-sub2' : 'text-subText')}>
                                (tối ưu {OPTIMAL_WORD_RANGE.min}–{OPTIMAL_WORD_RANGE.max})
                            </span>
                        )}
                        {isEssay && (
                            <span className="inline-flex items-center gap-1 self-center">
                                {isEssayLengthMet ? (
                                    <>
                                        <LuCircleCheck className="size-3.5 text-main" aria-hidden="true" />
                                        <span className="font-semibold text-main">đạt mục tiêu ≥ {ESSAY_MIN_WORDS}</span>
                                    </>
                                ) : (
                                    `/ mục tiêu ≥ ${ESSAY_MIN_WORDS} (còn ${ESSAY_MIN_WORDS - wordCount})`
                                )}
                            </span>
                        )}
                    </span>
                    <span className="bg-sub2/40 w-px h-4" aria-hidden="true" />
                    <span>
                        Ký tự: <strong className="font-semibold tabular-nums text-main">{value.length}</strong>
                    </span>
                </div>

                {isSentence && (
                    <ul className="flex flex-wrap items-center gap-1.5" aria-label="Từ khóa đã phát hiện">
                        {keywords.map((keyword, index) => {
                            const usage = keywordUsages[index];
                            return (
                                <li
                                    key={keyword.word}
                                    className={cn(
                                        'px-2 py-0.5 rounded font-semibold text-[11px]',
                                        usage ? 'bg-sub2 text-white' : 'bg-white text-subText border border-dashed border-sub2/60',
                                    )}
                                >
                                    {usage
                                        ? usage.toLowerCase() === keyword.word
                                            ? `"${usage}"`
                                            : `"${usage}" (${keyword.word})`
                                        : `Thiếu "${keyword.word}"`}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
