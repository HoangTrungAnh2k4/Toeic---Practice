import { cn } from '@/lib/utils';
import { ReviewQuestion } from '../../types';

interface ReviewQuestionNavProps {
    questions: ReviewQuestion[];
}

export default function ReviewQuestionNav({ questions }: ReviewQuestionNavProps) {
    return (
        <nav
            aria-label="Danh sách câu hỏi"
            className="lg:top-4 lg:sticky flex flex-col gap-3 bg-card shadow-sm p-4 border border-sub2/30 rounded-xl"
        >
            {/* lg:flex-nowrap: cột nhiều dòng (wrap) cho item rộng theo min-content → tràn khung, không truncate */}
            <ol className="flex lg:flex-col flex-wrap lg:flex-nowrap gap-2">
                {questions.map(({ question: { id, number }, template, response, annotations }) => {
                    const score = response?.score ?? null;
                    const maxScore = response?.max_score ?? null;
                    return (
                        <li key={id}>
                            <a
                                href={`#q-${number}`}
                                className="flex items-center gap-2 hover:bg-sub1/50 p-2 border border-sub2/20 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 transition-colors"
                            >
                                <span className="flex justify-center items-center bg-main rounded-md size-8 font-bold text-sub3 text-xs shrink-0">
                                    Q{number}
                                </span>
                                <span className="hidden lg:flex flex-col flex-1 min-w-0">
                                    <span className="font-semibold text-main text-sm truncate">{template.task}</span>
                                    <span className="text-subText text-xs">
                                        {annotations.length
                                            ? `${annotations.length} nhận xét`
                                            : !(response?.text_answer ?? response?.transcript)?.trim()
                                                ? 'Chưa trả lời'
                                                : score !== null && score === maxScore
                                                    ? 'Không có lỗi'
                                                    : 'Xem nhận xét'}
                                    </span>
                                </span>
                                {score !== null && maxScore !== null && (
                                    <span
                                        className={cn(
                                            'px-1.5 py-0.5 rounded-md font-bold tabular-nums text-[0.6875rem]',
                                            score === maxScore ? 'bg-main text-sub1' : 'bg-sub3/25 text-main',
                                        )}
                                    >
                                        {score}/{maxScore}
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
