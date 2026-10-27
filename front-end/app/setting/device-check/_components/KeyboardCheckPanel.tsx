'use client';

import { useId, useRef, useState } from 'react';
import { LuEraser } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { evaluateTyping, PASTE_BLOCKED_FEEDBACK, TYPING_FEEDBACK, TYPING_SAMPLE } from '../utils';
import CheckNotice from './CheckNotice';

interface KeyboardCheckPanelProps {
    value: string;
    onChange: (value: string) => void;
}

export default function KeyboardCheckPanel({ value, onChange }: KeyboardCheckPanelProps) {
    const inputId = useId();
    const feedbackId = useId();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [isPasteBlocked, setIsPasteBlocked] = useState(false);

    const { state, matched } = evaluateTyping(value);
    const hasError = state === 'mismatch' || state === 'ime';
    const feedback = isPasteBlocked ? PASTE_BLOCKED_FEEDBACK : TYPING_FEEDBACK[state];

    const handleChange = (next: string) => {
        setIsPasteBlocked(false);
        onChange(next);
    };

    const handleClear = () => {
        handleChange('');
        textareaRef.current?.focus();
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 bg-sub1/40 p-4 rounded-lg">
                <span className="font-semibold text-subText text-xs uppercase tracking-wider">Câu mẫu</span>
                <p lang="en" className="sr-only">
                    {TYPING_SAMPLE}
                </p>
                {/* Phần đã gõ đúng đậm màu, ký tự gõ sai tô đỏ, phần còn lại nhạt */}
                <p lang="en" aria-hidden="true" className="font-medium text-lg leading-relaxed select-none">
                    <span className="text-main">{TYPING_SAMPLE.slice(0, matched)}</span>
                    {hasError && (
                        <span className="bg-destructive/15 rounded-sm text-destructive underline decoration-2">
                            {TYPING_SAMPLE.charAt(matched)}
                        </span>
                    )}
                    <span className="text-sub2">{TYPING_SAMPLE.slice(hasError ? matched + 1 : matched)}</span>
                </p>
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center gap-3">
                    <label htmlFor={inputId} className="font-semibold text-subText text-xs uppercase tracking-wider">
                        Gõ lại câu mẫu
                    </label>
                    <span aria-hidden="true" className="tabular-nums text-subText text-xs">
                        {matched}/{TYPING_SAMPLE.length} ký tự
                    </span>
                </div>
                <Textarea
                    ref={textareaRef}
                    id={inputId}
                    value={value}
                    onChange={(event) => handleChange(event.target.value)}
                    onPaste={(event) => {
                        event.preventDefault();
                        setIsPasteBlocked(true);
                    }}
                    onDrop={(event) => event.preventDefault()}
                    lang="en"
                    autoCapitalize="none"
                    autoComplete="off"
                    aria-describedby={feedbackId}
                    aria-invalid={hasError || undefined}
                    placeholder="Bắt đầu gõ tại đây…"
                    className="bg-white p-4 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 min-h-28 text-main md:text-base text-base leading-relaxed resize-none placeholder:text-sub2"
                />
            </div>

            <div id={feedbackId} role="status" aria-live="polite">
                <CheckNotice
                    tone={feedback.tone}
                    action={
                        hasError && (
                            <Button
                                type="button"
                                variant="third"
                                size="sm"
                                onClick={handleClear}
                                className="gap-2 bg-white"
                            >
                                <LuEraser className="size-4" aria-hidden="true" />
                                Xóa & gõ lại
                            </Button>
                        )
                    }
                >
                    {feedback.message}
                </CheckNotice>
            </div>
        </div>
    );
}
