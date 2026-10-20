import { LuListChecks, LuMail } from 'react-icons/lu';
import type { Question } from '@/lib/domain/types';

interface EmailStimulusProps {
    question: Question;
    /** Email đề bài: ngữ liệu riêng của câu, hoặc ngữ liệu chung của Part. */
    email: string | null;
}

export default function EmailStimulus({ question, email }: EmailStimulusProps) {
    const titleId = `email-q${question.number}-title`;

    return (
        <section
            aria-labelledby={titleId}
            className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
        >
            <h3 id={titleId} className="flex items-center gap-2 font-bold text-main text-xs uppercase tracking-wider">
                <LuMail className="size-4 text-sub2" aria-hidden="true" />
                E-mail
            </h3>
            {email ? (
                <p className="bg-sub1/50 p-4 rounded-lg text-main text-sm leading-relaxed whitespace-pre-line">{email}</p>
            ) : (
                <p className="bg-sub1/50 p-4 rounded-lg text-subText text-sm">Đề chưa có nội dung email cho câu này.</p>
            )}

            {/* Đề mới để directions trong email nên không có `prompt` */}
            {question.prompt && (
                <div className="flex items-start gap-3 bg-sub3/15 p-4 border border-sub3/50 rounded-lg">
                    <LuListChecks className="mt-0.5 size-4 text-main shrink-0" aria-hidden="true" />
                    <div className="flex flex-col gap-1">
                        <span className="font-bold text-main text-xs uppercase tracking-wider">Yêu cầu</span>
                        <p className="text-main text-sm leading-relaxed whitespace-pre-line">{question.prompt}</p>
                    </div>
                </div>
            )}

            <div className="flex justify-end px-1 text-xs">
                <span className="font-semibold text-main">Thang điểm: 0 – 4</span>
            </div>
        </section>
    );
}
