'use client';

import { LuArrowRight, LuCheck, LuLock, LuTimer } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { ProgressQuestion } from '../types';

interface QuestionProgressionProps {
    questions: ProgressQuestion[];
    currentIndex: number;
    speakSec: number;
    /** Chế độ có hướng dẫn: được chuyển câu bất cứ lúc nào. */
    isGuided: boolean;
    canProceed: boolean;
    isLast: boolean;
    /** Đã bấm Kết thúc, đang chờ chấm xong. */
    isSubmitting?: boolean;
    onNextQuestion: () => void;
}

export default function QuestionProgression({
    questions,
    currentIndex,
    speakSec,
    isGuided,
    canProceed,
    isLast,
    isSubmitting = false,
    onNextQuestion,
}: QuestionProgressionProps) {
    const total = questions.length;
    const completedCount = currentIndex;
    const activeQuestion = questions[currentIndex];
    const progressPercent = Math.round((completedCount / total) * 100);

    return (
        <div className="bg-white mt-auto px-4 sm:px-6 py-4 border-sub1 border-t">
            <div className="flex md:flex-row flex-col justify-between md:items-center gap-4 mx-auto max-w-6xl">
                {/* Questions Status Ribbon */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-main text-xs uppercase tracking-wider">
                                Tiến độ bài thi
                            </span>
                            <span className="bg-sub1 px-2 py-0.5 rounded-full font-semibold tabular-nums text-main text-[11px]">
                                {completedCount}/{total}
                            </span>
                        </div>
                        {!isGuided && (
                            <span className="inline-flex items-center gap-1 text-sub2 text-[11px]">
                                <LuLock className="size-3" aria-hidden="true" />
                                Khóa tự chọn câu theo quy chế ETS
                            </span>
                        )}
                    </div>

                    <ol className="flex flex-wrap items-center gap-1.5" aria-label="Danh sách câu hỏi Speaking">
                        {questions.map((q, index) => {
                            const isCompleted = index < currentIndex;
                            const isActive = index === currentIndex;

                            return (
                                <li
                                    key={q.number}
                                    title={`Câu ${q.number}: ${q.task}`}
                                    aria-current={isActive ? 'step' : undefined}
                                    aria-label={`Câu ${q.number}${isCompleted ? ', đã hoàn thành' : isActive ? ', đang làm' : ', chưa làm'}`}
                                    className={cn(
                                        'flex justify-center items-center rounded-lg size-9 font-semibold tabular-nums text-xs transition-colors duration-200',
                                        isCompleted && 'gap-0.5 bg-sub2 text-white',
                                        isActive &&
                                            'bg-main text-sub3 font-bold ring-2 ring-sub3 ring-offset-2 ring-offset-white shadow-md shadow-main/25',
                                        !isCompleted && !isActive && 'bg-sub1 text-sub2 cursor-not-allowed'
                                    )}
                                >
                                    {isCompleted && <LuCheck className="size-3" aria-hidden="true" />}
                                    {q.number}
                                </li>
                            );
                        })}
                    </ol>

                    <div
                        className="bg-sub1 rounded-full w-full h-1 overflow-hidden"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-valuenow={completedCount}
                        aria-label="Tiến độ hoàn thành"
                    >
                        <div
                            className="bg-linear-to-r from-sub2 to-sub3 rounded-full h-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Action Navigation */}
                <div className="flex justify-between md:justify-end items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-sub3/10 px-3 py-2 border border-sub3/40 rounded-lg">
                        <LuTimer className="size-4 text-sub3" aria-hidden="true" />
                        <div className="leading-tight">
                            <div className="text-sub2 text-[11px]">
                                {activeQuestion ? `Đang làm câu ${activeQuestion.number}` : 'Chuyển câu'}
                            </div>
                            <div className="font-semibold text-main text-xs">
                                {isGuided ? 'Chuyển câu bất cứ lúc nào' : `Chuyển câu khi hết ${speakSec}s`}
                            </div>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={!canProceed}
                        aria-busy={isSubmitting}
                        onClick={onNextQuestion}
                        className={cn(
                            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs transition-colors duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 focus-visible:ring-offset-2',
                            canProceed
                                ? 'bg-main text-sub1 shadow-md shadow-main/20 hover:bg-sub3 hover:text-main cursor-pointer'
                                : 'bg-sub1 text-sub2 cursor-not-allowed'
                        )}
                    >
                        <span>{isSubmitting ? 'Đang chấm bài…' : isLast ? 'Kết thúc' : 'Tiếp tục'}</span>
                        <LuArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}
