'use client';

import { LuArrowRight, LuCheck } from 'react-icons/lu';
import { SPEAKING_QUESTIONS } from '../utils';

interface QuestionProgressionProps {
    onNextQuestion?: () => void;
    canProceed?: boolean;
}

export default function QuestionProgression({
    onNextQuestion,
    canProceed = false,
}: QuestionProgressionProps) {
    return (
        <div className="mt-auto border-t border-border bg-card px-6 py-4 shadow-xs">
            <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 md:flex-row">
                {/* 11 Questions Status Ribbon */}
                <div className="flex w-full flex-col gap-2 md:w-auto">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                            Bảng tiến độ 11 câu hỏi Speaking:
                        </span>
                        <span className="text-[11px] text-muted-foreground sm:inline">
                            (Khóa tự chọn câu theo quy chế ETS)
                        </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-1.5">
                        {SPEAKING_QUESTIONS.map((q) => {
                            if (q.status === 'completed') {
                                return (
                                    <div
                                        key={q.id}
                                        title={`Câu ${q.id}: ${q.title} (${q.description})`}
                                        className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg bg-emerald-100 text-xs font-semibold text-emerald-800 shadow-xs"
                                    >
                                        <LuCheck className="mr-0.5 size-3" aria-hidden="true" />
                                        {q.id}
                                    </div>
                                );
                            }

                            if (q.status === 'active') {
                                return (
                                    <div
                                        key={q.id}
                                        title={`Câu ${q.id}: ${q.title} (${q.description})`}
                                        className="flex size-9 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground shadow-sm ring-2 ring-primary ring-offset-2"
                                    >
                                        {q.id}
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={q.id}
                                    title={`Câu ${q.id}: ${q.title} (${q.description})`}
                                    className="flex size-9 cursor-not-allowed items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground"
                                >
                                    {q.id}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Action Navigation Button */}
                <div className="flex w-full items-center justify-end gap-3 md:w-auto">
                    <div className="hidden text-right sm:block">
                        <div className="text-[11px] text-muted-foreground">Trạng thái nút chuyển:</div>
                        <div className="text-xs font-semibold text-destructive">Tự động khi hết 30s</div>
                    </div>

                    <button
                        type="button"
                        disabled={!canProceed}
                        onClick={onNextQuestion}
                        className="inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-muted px-5 py-2.5 text-xs font-semibold text-muted-foreground shadow-none disabled:opacity-50"
                    >
                        <span>Tiếp tục (Next)</span>
                        <LuArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}
