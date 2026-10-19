import { LuCheck, LuSpellCheck2 } from 'react-icons/lu';
import { cn } from '@/lib/utils';

interface QuestionNavigatorProps {
    answers: string[];
    partNo: number;
    /** Số thứ tự của câu đầu tiên trong Part (vd. 6 cho Q6-7). */
    firstNumber: number;
    currentIndex: number;
    onSelect: (index: number) => void;
}

export default function QuestionNavigator({ answers, partNo, firstNumber, currentIndex, onSelect }: QuestionNavigatorProps) {
    const answeredCount = answers.filter((answer) => answer.trim()).length;
    const progressPercent = Math.round((answeredCount / answers.length) * 100);

    return (
        <nav
            aria-label={`Chọn câu hỏi trong nhóm ${partNo}`}
            className="flex md:flex-row flex-col justify-between md:items-center gap-3 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl"
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

            <div className="flex flex-wrap items-center gap-3">
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
                <span className="inline-flex items-center gap-1.5 bg-sub1/60 px-2.5 py-1 rounded-md font-medium text-[11px] text-subText">
                    <LuSpellCheck2 className="size-3.5 text-destructive" aria-hidden="true" />
                    Spellcheck: Tắt
                </span>
            </div>
        </nav>
    );
}
