'use client';

import { LuArrowRight, LuCheck, LuLock, LuTimer } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { SPEAKING_QUESTIONS } from '../utils';

interface QuestionProgressionProps {
    onNextQuestion?: () => void;
    canProceed?: boolean;
}

export default function QuestionProgression({ onNextQuestion, canProceed = false }: QuestionProgressionProps) {
    const total = SPEAKING_QUESTIONS.length;
    const completedCount = SPEAKING_QUESTIONS.filter((q) => q.status === 'completed').length;
    const activeQuestion = SPEAKING_QUESTIONS.find((q) => q.status === 'active');
    const progressPercent = Math.round((completedCount / total) * 100);

    return (
        <div className="bg-white mt-auto px-4 sm:px-6 py-4 border-[#E8E5F5] border-t">
            <div className="flex md:flex-row flex-col justify-between md:items-center gap-4 mx-auto max-w-6xl">
                {/* Questions Status Ribbon */}
                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-[#3C3454] text-xs uppercase tracking-wider">
                                Tiến độ bài thi
                            </span>
                            <span className="bg-[#E8E5F5] px-2 py-0.5 rounded-full font-semibold tabular-nums text-[#3C3454] text-[11px]">
                                {completedCount}/{total}
                            </span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[#8B84B8] text-[11px]">
                            <LuLock className="size-3" aria-hidden="true" />
                            Khóa tự chọn câu theo quy chế ETS
                        </span>
                    </div>

                    <ol className="flex flex-wrap items-center gap-1.5" aria-label="Danh sách câu hỏi Speaking">
                        {SPEAKING_QUESTIONS.map((q) => {
                            const isCompleted = q.status === 'completed';
                            const isActive = q.status === 'active';

                            return (
                                <li
                                    key={q.id}
                                    title={`Câu ${q.id}: ${q.title} (${q.description})`}
                                    aria-current={isActive ? 'step' : undefined}
                                    aria-label={`Câu ${q.id}${isCompleted ? ', đã hoàn thành' : isActive ? ', đang làm' : ', chưa làm'}`}
                                    className={cn(
                                        'flex justify-center items-center rounded-lg size-9 font-semibold tabular-nums text-xs transition-colors duration-200',
                                        isCompleted && 'gap-0.5 bg-[#8B84B8] text-white',
                                        isActive &&
                                            'bg-[#3C3454] text-[#F5B841] font-bold ring-2 ring-[#F5B841] ring-offset-2 ring-offset-white shadow-md shadow-[#3C3454]/25',
                                        !isCompleted && !isActive && 'bg-[#E8E5F5] text-[#8B84B8] cursor-not-allowed'
                                    )}
                                >
                                    {isCompleted && <LuCheck className="size-3" aria-hidden="true" />}
                                    {q.id}
                                </li>
                            );
                        })}
                    </ol>

                    <div
                        className="bg-[#E8E5F5] rounded-full w-full h-1 overflow-hidden"
                        role="progressbar"
                        aria-valuemin={0}
                        aria-valuemax={total}
                        aria-valuenow={completedCount}
                        aria-label="Tiến độ hoàn thành"
                    >
                        <div
                            className="bg-linear-to-r from-[#8B84B8] to-[#F5B841] rounded-full h-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                </div>

                {/* Action Navigation */}
                <div className="flex justify-between md:justify-end items-center gap-3 w-full md:w-auto">
                    <div className="flex items-center gap-2 bg-[#F5B841]/10 px-3 py-2 border border-[#F5B841]/40 rounded-lg">
                        <LuTimer className="size-4 text-[#F5B841]" aria-hidden="true" />
                        <div className="leading-tight">
                            <div className="text-[#8B84B8] text-[11px]">
                                {activeQuestion ? `Đang làm câu ${activeQuestion.id}` : 'Chuyển câu'}
                            </div>
                            <div className="font-semibold text-[#3C3454] text-xs">Tự động khi hết 30s</div>
                        </div>
                    </div>

                    <button
                        type="button"
                        disabled={!canProceed}
                        onClick={onNextQuestion}
                        className={cn(
                            'inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-xs transition-colors duration-200',
                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5B841] focus-visible:ring-offset-2',
                            canProceed
                                ? 'bg-[#3C3454] text-[#E8E5F5] shadow-md shadow-[#3C3454]/20 hover:bg-[#F5B841] hover:text-[#3C3454] cursor-pointer'
                                : 'bg-[#E8E5F5] text-[#8B84B8] cursor-not-allowed'
                        )}
                    >
                        <span>Tiếp tục</span>
                        <LuArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </div>
    );
}
