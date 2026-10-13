import { cn } from '@/lib/utils';
import { ReviewQuestion } from '../../types';

interface ReviewQuestionNavProps {
    questions: ReviewQuestion[];
}

export default function ReviewQuestionNav({ questions }: ReviewQuestionNavProps) {
    return (
        <nav
            aria-label="Danh sách câu hỏi"
            className="flex flex-col gap-3 bg-card shadow-sm p-4 border border-sub2/30 rounded-xl lg:top-4 lg:sticky"
        >
            <span className="font-semibold text-subText text-xs uppercase tracking-wider">Đi tới câu</span>
            <ol className="flex lg:flex-col flex-wrap gap-2">
                {questions.map(({ number, task, score, annotations }) => {
                    const isPerfect = score && score.value === score.max;
                    return (
                        <li key={number}>
                            <a
                                href={`#q-${number}`}
                                className="flex items-center gap-2 hover:bg-sub1/50 p-2 border border-sub2/20 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                            >
                                <span className="flex justify-center items-center bg-main rounded-md size-8 font-bold text-sub3 text-xs shrink-0">
                                    Q{number}
                                </span>
                                <span className="hidden lg:flex flex-col flex-1 min-w-0">
                                    <span className="font-semibold text-main text-xs truncate">{task}</span>
                                    <span className="text-[0.6875rem] text-subText">
                                        {annotations.length ? `${annotations.length} nhận xét` : 'Không có lỗi'}
                                    </span>
                                </span>
                                {score && (
                                    <span
                                        className={cn(
                                            'px-1.5 py-0.5 rounded-md font-bold text-[0.6875rem] tabular-nums',
                                            isPerfect ? 'bg-main text-sub1' : 'bg-sub3/25 text-main',
                                        )}
                                    >
                                        {score.value}/{score.max}
                                    </span>
                                )}
                            </a>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
