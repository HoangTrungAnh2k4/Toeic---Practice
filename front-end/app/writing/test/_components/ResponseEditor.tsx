'use client';

import { KeyboardEvent } from 'react';
import { LuCircleCheck, LuTriangleAlert } from 'react-icons/lu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useTextHistory } from '../_lib/useTextHistory';
import { countSentences, countWords, ESSAY_MIN_WORDS, OPTIMAL_WORD_RANGE } from '../utils';

interface ResponseEditorProps {
    /** Part 1 viết một câu; Part 3 là bài luận có mục tiêu số từ; Part 2 là đoạn văn tự do. */
    partNo: number;
    questionNumber: number;
    value: string;
    onChange: (value: string) => void;
    isLocked: boolean;
}

export default function ResponseEditor({ partNo, questionNumber, value, onChange, isLocked }: ResponseEditorProps) {
    const isSentence = partNo === 1;
    const isEssay = partNo === 3;
    const { commit, undo, redo } = useTextHistory(value, onChange);

    const wordCount = countWords(value);
    const sentenceCount = countSentences(value);
    const isWordCountOptimal = wordCount >= OPTIMAL_WORD_RANGE.min && wordCount <= OPTIMAL_WORD_RANGE.max;
    const isEssayLengthMet = wordCount >= ESSAY_MIN_WORDS;

    // Ctrl+Z / Ctrl+Y dùng lịch sử riêng vì undo native của textarea controlled không ổn định
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
            {/* Response area */}
            <div className="flex flex-col gap-3 p-4 sm:p-5">
                <label htmlFor={textareaId} className="font-semibold text-[#333] text-xs uppercase tracking-wider">
                    {isSentence ? 'Your Response — một câu hoàn chỉnh' : 'Your Response'}
                </label>
                <Textarea
                    id={textareaId}
                    value={value}
                    onChange={(e) => commit(e.target.value, { isTyping: true })}
                    onKeyDown={handleKeyDown}
                    readOnly={isLocked}
                    aria-readonly={isLocked}
                    autoCapitalize="none"
                    autoComplete="off"
                    placeholder="Nhập câu trả lời của bạn tại đây..."
                    className={cn(
                        'bg-white read-only:bg-sub1/40 p-4 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 text-main placeholder:text-sub2 text-base md:text-base leading-relaxed resize-y',
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
            </div>

            {/* Live metrics */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 bg-sub1/60 px-4 sm:px-5 py-3 border-sub2/20 border-t text-subText text-xs" aria-live="polite">
                <span className="flex items-baseline gap-1.5">
                    Số từ:
                    <strong className="font-bold tabular-nums text-main text-base">{wordCount}</strong>
                    {isSentence && (
                        <span className={cn(isWordCountOptimal ? 'text-sub2' : 'text-subText')}>
                            (tối ưu {OPTIMAL_WORD_RANGE.min}–{OPTIMAL_WORD_RANGE.max})
                        </span>
                    )}
                    {isEssay && (
                        <span className="inline-flex items-center self-center gap-1">
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
        </section>
    );
}
