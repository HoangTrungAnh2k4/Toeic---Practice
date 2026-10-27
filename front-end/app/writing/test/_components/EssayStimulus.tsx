import { LuFileText } from 'react-icons/lu';
import type { Question } from '@/lib/domain/types';
import { ESSAY_MIN_WORDS } from '../utils';

interface EssayStimulusProps {
    question: Question;
    /** Ngữ liệu bổ sung (nếu có): riêng của câu, hoặc chung của Part. */
    context: string | null;
}

export default function EssayStimulus({ question, context }: EssayStimulusProps) {
    const titleId = `essay-q${question.number}-title`;

    return (
        <section
            aria-labelledby={titleId}
            className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
        >
            <h3 id={titleId} className="flex items-center gap-2 font-bold text-main text-xs uppercase tracking-wider">
                Essay question
            </h3>
            {context && (
                <p className="bg-sub1/50 p-4 rounded-lg text-main text-sm leading-relaxed whitespace-pre-line">{context}</p>
            )}
            <p className="bg-sub3/15 p-4 border border-sub3/50 rounded-lg font-medium text-main text-base leading-relaxed whitespace-pre-line">
                {question.prompt}
            </p>

            <div className="flex flex-wrap justify-between gap-2 px-1 text-xs">
                <span className="text-subText">Nên viết ít nhất {ESSAY_MIN_WORDS} từ</span>
                <span className="font-semibold text-main">Thang điểm: 0 – 5</span>
            </div>
        </section>
    );
}
