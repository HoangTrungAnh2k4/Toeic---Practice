import { LuAudioLines, LuCircleAlert, LuImage, LuLightbulb, LuSparkles } from 'react-icons/lu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { StudioQuestion } from '../types';

interface QuestionEditorCardProps {
    question: StudioQuestion;
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export default function QuestionEditorCard({ question, label, value, onChange }: QuestionEditorCardProps) {
    const fieldId = `question-${question.id}`;
    const errorId = `${fieldId}-error`;
    const isEmpty = !value.trim();

    return (
        <article
            aria-labelledby={`${fieldId}-title`}
            className="flex flex-col gap-3 bg-sub1/30 p-4 border border-sub2/20 rounded-xl"
        >
            {/* Question header */}
            <div className="flex flex-wrap justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <span className="flex justify-center items-center bg-main rounded-full size-7 font-bold text-sub3 text-xs tabular-nums">
                        {question.number}
                    </span>
                    <h4 id={`${fieldId}-title`} className="font-semibold text-main text-sm">
                        Câu {question.number}
                    </h4>
                    <span className="bg-white px-2 py-0.5 border border-sub2/30 rounded-full font-medium text-subText text-xs tabular-nums">
                        {question.responseSeconds} giây trả lời
                    </span>
                </div>
                <span
                    className={cn(
                        'inline-flex items-center gap-1 font-semibold text-xs',
                        question.audioReady ? 'text-sub2' : 'text-destructive',
                    )}
                >
                    {question.audioReady ? (
                        <LuAudioLines className="size-3.5" aria-hidden="true" />
                    ) : (
                        <LuCircleAlert className="size-3.5" aria-hidden="true" />
                    )}
                    {question.audioReady ? 'Audio prompt đã khớp' : 'Thiếu audio prompt'}
                </span>
            </div>

            {/* Picture stimulus placeholder (Part 2) */}
            {question.media && (
                <figure className="flex flex-col justify-center items-center gap-2 bg-white p-4 border border-sub2/40 border-dashed rounded-lg aspect-video text-center">
                    <LuImage className="size-8 text-sub2" aria-hidden="true" />
                    <figcaption className="max-w-md text-subText text-xs leading-relaxed">
                        <span className="block font-semibold text-main">Ảnh câu {question.number} · 16:9</span>
                        {question.media}
                    </figcaption>
                </figure>
            )}

            {/* Prompt editor */}
            <div className="flex flex-col gap-1.5">
                <label htmlFor={fieldId} className="font-semibold text-subText text-xs uppercase tracking-wider">
                    {label}
                </label>
                <Textarea
                    id={fieldId}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    aria-invalid={isEmpty ? true : undefined}
                    aria-describedby={isEmpty ? errorId : undefined}
                    className="bg-white border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 min-h-12 font-medium text-main md:text-sm leading-relaxed"
                />
                {isEmpty && (
                    <p id={errorId} className="font-medium text-destructive text-xs">
                        Nội dung không được để trống.
                    </p>
                )}
            </div>

            {/* AI guidance */}
            {(question.sampleAnswer || question.hint) && (
                <div className="flex flex-col gap-1.5 bg-white p-3 border-sub3 border-l-4 rounded-lg">
                    {question.sampleAnswer && (
                        <>
                            <span className="flex flex-wrap justify-between items-center gap-1 font-semibold text-xs">
                                <span className="inline-flex items-center gap-1 text-main">
                                    <LuSparkles className="size-3.5 text-sub3" aria-hidden="true" />
                                    Câu trả lời mẫu Level 7–8 (ETS Rubric)
                                </span>
                                <span className="font-medium text-sub2">Tạo bởi AI</span>
                            </span>
                            <p className="text-subText text-xs italic leading-relaxed">“{question.sampleAnswer}”</p>
                        </>
                    )}
                    {question.hint && (
                        <p className="flex items-start gap-1.5 font-medium text-main text-xs leading-relaxed">
                            <LuLightbulb className="mt-0.5 size-3.5 text-sub3 shrink-0" aria-hidden="true" />
                            {question.hint}
                        </p>
                    )}
                </div>
            )}
        </article>
    );
}
