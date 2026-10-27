import type { ReactNode } from 'react';
import { LuCheck, LuInfo } from 'react-icons/lu';
import { cn } from '@/lib/utils';
import { TOTAL_EXAM_QUESTIONS } from '../utils';

interface QuestionNavigatorProps {
    answers: string[];
    partNo: number;
    /** Số thứ tự của câu đầu tiên trong Part (vd. 6 cho Q6-7). */
    firstNumber: number;
    currentIndex: number;
    onSelect: (index: number) => void;
}

/** Lời dẫn theo Part (key = `part_no`). */
const DIRECTIONS: Record<number, ReactNode> = {
    1: (
        <>
            Write <strong>ONE</strong> sentence that is based on the picture. You must use the <strong>TWO</strong>{' '}
            words or phrases provided. You may change the forms of the words and you may use them in any order.
        </>
    ),
    2: (
        <>
            Read the e-mail and write a response. Your response will be scored on the quality and variety of your
            sentences, vocabulary, and organization. You have <strong>10 minutes</strong> for each e-mail.
        </>
    ),
    3: (
        <>
            Write an essay in response to a question that asks you to state, explain, and support your opinion on an
            issue. Typically, an effective essay will contain a minimum of <strong>300 words</strong>. You have{' '}
            <strong>30 minutes</strong> to plan, write, and revise your essay.
        </>
    ),
};

export default function QuestionNavigator({ answers, partNo, firstNumber, currentIndex, onSelect }: QuestionNavigatorProps) {
    const answeredCount = answers.filter((answer) => answer.trim()).length;
    const progressPercent = Math.round((answeredCount / answers.length) * 100);

    return (
        <div className="flex flex-col gap-3 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl">
            <nav
                aria-label={`Chọn câu hỏi trong nhóm ${partNo}`}
                className="flex md:flex-row flex-col justify-between md:items-center gap-3"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <span className="font-semibold text-main text-xs uppercase tracking-wider">Câu hỏi nhóm {partNo}</span>
                    <ol className="flex flex-wrap items-center gap-1.5">
                        {answers.map((answer, index) => {
                            const isCurrent = index === currentIndex;
                            const isAnswered = Boolean(answer.trim());
                            return (
                                <li key={index}>
                                    <button
                                        type="button"
                                        onClick={() => onSelect(index)}
                                        aria-current={isCurrent ? 'step' : undefined}
                                        aria-label={`Câu ${firstNumber + index}${isAnswered ? ', đã có câu trả lời' : ', chưa trả lời'}`}
                                        className={cn(
                                            'flex justify-center items-center gap-0.5 rounded-lg size-9 font-semibold tabular-nums text-xs transition-colors duration-200 cursor-pointer',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 focus-visible:ring-offset-2',
                                            isCurrent &&
                                                'bg-main font-bold text-sub3 ring-2 ring-sub3 ring-offset-2 ring-offset-white shadow-md shadow-main/25',
                                            !isCurrent && isAnswered && 'bg-sub2 text-white hover:bg-main',
                                            !isCurrent && !isAnswered && 'bg-sub1 text-main hover:bg-sub2/40',
                                        )}
                                    >
                                        {!isCurrent && isAnswered && <LuCheck className="size-3" aria-hidden="true" />}
                                        {firstNumber + index}
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                </div>

                <div className="flex items-center gap-2 min-w-40">
                    <div
                        role="progressbar"
                        aria-label="Số câu đã có câu trả lời"
                        aria-valuemin={0}
                        aria-valuemax={answers.length}
                        aria-valuenow={answeredCount}
                        className="flex-1 bg-sub1 rounded-full h-1.5 overflow-hidden"
                    >
                        <div
                            className="bg-linear-to-r from-sub2 to-sub3 rounded-full h-full transition-all duration-500"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    <span className="font-semibold tabular-nums text-main text-xs">
                        {answeredCount}/{answers.length}
                    </span>
                </div>
            </nav>

            <section aria-labelledby="writing-directions-title" className="flex items-start gap-2.5 pt-3 border-sub2/20 border-t">
                <LuInfo className="mt-0.5 size-4 text-sub2 shrink-0" aria-hidden="true" />
                <p className="text-main text-sm leading-relaxed">
                    <span id="writing-directions-title" className="mr-2 font-bold text-xs uppercase tracking-wider">
                        Directions · Question {firstNumber + currentIndex} of {TOTAL_EXAM_QUESTIONS}
                    </span>
                    {DIRECTIONS[partNo]}
                </p>
            </section>
        </div>
    );
}
