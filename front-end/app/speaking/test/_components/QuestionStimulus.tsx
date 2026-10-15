import { LuFileText, LuMessageCircleQuestion } from 'react-icons/lu';
import type { Question } from '@/lib/domain/types';

interface QuestionStimulusProps {
    question: Question;
    /** Ngữ liệu dùng chung của cả cụm câu (tình huống Part 3, bảng thông tin Part 4). */
    context: string | null;
    /** Part 1: `prompt` là đoạn văn cần đọc to. */
    isReadAloud: boolean;
}

/** Nội dung câu hỏi dạng chữ cho các Part không có tranh. */
export default function QuestionStimulus({ question, context, isReadAloud }: QuestionStimulusProps) {
    return (
        <section
            aria-label={`Nội dung câu ${question.number}`}
            className="flex flex-col gap-4 bg-white p-5 border border-sub1 rounded-2xl h-full"
        >
            {context && (
                <div className="flex flex-col gap-2 bg-sub1/60 p-4 rounded-xl">
                    <span className="flex items-center gap-2 font-semibold text-main text-xs uppercase tracking-wider">
                        <LuFileText className="size-4 text-sub2" aria-hidden="true" />
                        Thông tin đề bài
                    </span>
                    <p className="text-main text-sm leading-relaxed whitespace-pre-line">{context}</p>
                </div>
            )}

            <div className="flex flex-col gap-2">
                <span className="flex items-center gap-2 font-semibold text-main text-xs uppercase tracking-wider">
                    <LuMessageCircleQuestion className="size-4 text-sub2" aria-hidden="true" />
                    {isReadAloud ? 'Đoạn văn cần đọc to' : `Câu hỏi ${question.number}`}
                </span>
                <p className="font-medium text-main text-base leading-relaxed">{question.prompt}</p>
            </div>
        </section>
    );
}
