import type { ReactNode } from 'react';
import { LuInfo } from 'react-icons/lu';
import { TOTAL_EXAM_QUESTIONS } from '../utils';

interface DirectionsCardProps {
    partNo: number;
    questionNumber: number;
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

export default function DirectionsCard({ partNo, questionNumber }: DirectionsCardProps) {
    return (
        <section
            aria-labelledby="writing-directions-title"
            className="flex items-start gap-3 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
        >
            <span className="flex justify-center items-center bg-sub1 rounded-lg size-9 text-main shrink-0">
                <LuInfo className="size-5" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 id="writing-directions-title" className="font-bold text-main text-xs uppercase tracking-wider">
                        Directions
                    </h2>
                    <span className="bg-sub1 px-2 py-0.5 rounded-md font-semibold tabular-nums text-[11px] text-main">
                        Question {questionNumber} of {TOTAL_EXAM_QUESTIONS}
                    </span>
                </div>
                <p className="text-main text-sm leading-relaxed">{DIRECTIONS[partNo]}</p>
            </div>
        </section>
    );
}
