import { LuCircleCheck, LuClock, LuKeyRound, LuSparkles } from 'react-icons/lu';
import { MistakeItem } from '@/app/mistakes/types';
import { cn } from '@/lib/utils';
import { placeAnnotations } from '../../_lib/annotate';
import { ReviewQuestion } from '../../types';
import AnnotatedResponse from './AnnotatedResponse';
import AnnotationList from './AnnotationList';

interface ReviewQuestionCardProps {
    question: ReviewQuestion;
    isSpeaking: boolean;
    mistakeIndex: Record<string, MistakeItem>;
    /** Bài đang chấm: chỉ hiện câu trả lời đã nộp, chưa có nhận xét. */
    isPending?: boolean;
}

const BLOCK_LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

export default function ReviewQuestionCard({ question, isSpeaking, mistakeIndex, isPending }: ReviewQuestionCardProps) {
    const { number, task, prompt, stimulus, keywords, score, response, responseTime, strengths } = question;
    const { placed, segments } = placeAnnotations(response, question.annotations);
    const isPerfect = score && score.value === score.max;

    return (
        <section
            id={`q-${number}`}
            aria-labelledby={`q-${number}-title`}
            className="flex flex-col gap-5 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl scroll-mt-4"
        >
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center gap-3">
                <div className="flex items-center gap-3">
                    <span className="flex justify-center items-center bg-main rounded-lg size-10 font-bold text-sub3 text-sm shrink-0">
                        Q{number}
                    </span>
                    <h2 id={`q-${number}-title`} className="font-bold text-main text-lg tracking-tight">
                        {task}
                    </h2>
                </div>
                {score && (
                    <span
                        className={cn(
                            'px-2.5 py-1 rounded-lg font-bold text-sm tabular-nums',
                            isPerfect ? 'bg-main text-sub1' : 'bg-sub3/25 text-main',
                        )}
                    >
                        {score.value}/{score.max} điểm
                    </span>
                )}
            </div>

            {/* Prompt */}
            <div className="flex flex-col gap-3 bg-sub1/50 p-4 rounded-xl">
                <span className={BLOCK_LABEL_CLASS}>Đề bài</span>
                <p className="font-medium text-main text-sm leading-relaxed">{prompt}</p>
                {stimulus && (
                    <p className="bg-card p-3 rounded-lg font-medium text-subText text-sm leading-relaxed whitespace-pre-line">
                        {stimulus}
                    </p>
                )}
                {keywords && (
                    <div className="flex flex-wrap items-center gap-1.5">
                        <LuKeyRound className="size-4 text-subText" aria-hidden="true" />
                        <span className="sr-only">Từ khoá bắt buộc:</span>
                        {keywords.map((word) => (
                            <span key={word} className="bg-card px-2 py-0.5 rounded-md font-semibold text-main text-xs">
                                {word}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            {/* Response */}
            <div className="flex flex-col gap-2">
                <div className="flex flex-wrap justify-between items-center gap-2">
                    <span className={BLOCK_LABEL_CLASS}>{isSpeaking ? 'Transcript câu trả lời' : 'Bài viết của bạn'}</span>
                    {responseTime && (
                        <span className="flex items-center gap-1 font-medium text-subText text-xs">
                            <LuClock className="size-3.5" aria-hidden="true" />
                            Thời gian nói tối đa {responseTime} giây
                        </span>
                    )}
                </div>
                <AnnotatedResponse segments={segments} />
            </div>

            {/* Feedback */}
            {!isPending &&
                (placed.length > 0 ? (
                    <AnnotationList placed={placed} mistakeIndex={mistakeIndex} />
                ) : (
                    <p className="flex items-center gap-2 bg-success/15 p-3 border border-success/60 rounded-lg font-medium text-main text-sm">
                        <LuCircleCheck className="size-4 shrink-0" aria-hidden="true" />
                        Không phát hiện lỗi đáng kể ở câu này.
                    </p>
                ))}

            {!isPending && strengths.length > 0 && (
                <div className="flex flex-col gap-2 pt-4 border-sub2/20 border-t">
                    <span className={BLOCK_LABEL_CLASS}>Điểm làm tốt</span>
                    <ul className="flex flex-col gap-1.5">
                        {strengths.map((item) => (
                            <li key={item} className="flex items-start gap-2 font-medium text-main text-sm">
                                <LuSparkles className="mt-0.5 size-4 text-sub2 shrink-0" aria-hidden="true" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </section>
    );
}
