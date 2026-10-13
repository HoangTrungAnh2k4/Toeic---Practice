import { LuEye, LuRotateCcw, LuSave, LuTimer } from 'react-icons/lu';
import Button from '@/components/ui/button';
import LinkButton from '@/components/ui/link-button';
import { Textarea } from '@/components/ui/textarea';
import { PartContent, StudioPart } from '../types';
import QuestionEditorCard from './QuestionEditorCard';

interface PartEditorProps {
    part: StudioPart;
    content: PartContent;
    isDirty: boolean;
    isModified: boolean;
    onContextChange: (value: string) => void;
    onPromptChange: (index: number, value: string) => void;
    onSave: () => void;
    onRestore: () => void;
}

export default function PartEditor({
    part,
    content,
    isDirty,
    isModified,
    onContextChange,
    onPromptChange,
    onSave,
    onRestore,
}: PartEditorProps) {
    const contextId = `context-${part.id}`;
    const isContextEmpty = Boolean(part.contextLabel) && !content.context.trim();
    const firstNumber = part.questions[0]?.number;
    const lastNumber = part.questions[part.questions.length - 1]?.number;
    const range = firstNumber === lastNumber ? `Câu ${firstNumber}` : `Câu ${firstNumber} – ${lastNumber}`;

    return (
        <section
            aria-labelledby={`editor-${part.id}-title`}
            className="flex flex-col gap-5 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl"
        >
            {/* Editor header */}
            <div className="flex sm:flex-row flex-col justify-between sm:items-start gap-3 pb-4 border-sub2/20 border-b">
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="bg-sub3 px-2 py-0.5 rounded font-bold text-main text-xs">{part.code}</span>
                        <h3 id={`editor-${part.id}-title`} className="font-bold text-main text-lg">
                            {part.title}
                        </h3>
                        <span className="font-medium text-sub2 text-sm">({range})</span>
                        {isDirty && (
                            <span className="bg-sub3/20 px-2 py-0.5 rounded-full font-semibold text-main text-xs">
                                Có thay đổi chưa lưu
                            </span>
                        )}
                    </div>
                    <p className="text-subText text-sm">{part.description}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 self-start bg-sub1/60 px-2.5 py-1.5 rounded-lg font-semibold text-main text-xs whitespace-nowrap shrink-0">
                    <LuTimer className="size-4 text-sub2" aria-hidden="true" />
                    {part.timing}
                </span>
            </div>

            {/* Context */}
            {part.contextLabel && (
                <div className="flex flex-col gap-1.5">
                    <label htmlFor={contextId} className="font-semibold text-subText text-xs uppercase tracking-wider">
                        {part.contextLabel}
                    </label>
                    <Textarea
                        id={contextId}
                        value={content.context}
                        onChange={(event) => onContextChange(event.target.value)}
                        aria-invalid={isContextEmpty ? true : undefined}
                        aria-describedby={isContextEmpty ? `${contextId}-error` : undefined}
                        className="bg-sub1/30 focus-visible:bg-white border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 text-main md:text-sm leading-relaxed whitespace-pre-wrap"
                    />
                    {isContextEmpty && (
                        <p id={`${contextId}-error`} className="font-medium text-destructive text-xs">
                            Phần này cần có nội dung để thí sinh nắm bối cảnh.
                        </p>
                    )}
                </div>
            )}

            {/* Questions */}
            <div className="flex flex-col gap-4">
                {part.questions.map((question, index) => (
                    <QuestionEditorCard
                        key={question.id}
                        question={question}
                        label={part.promptLabel}
                        value={content.prompts[index] ?? ''}
                        onChange={(value) => onPromptChange(index, value)}
                    />
                ))}
            </div>

            {/* Editor actions */}
            <div className="flex sm:flex-row flex-col-reverse justify-between sm:items-center gap-3 pt-4 border-sub2/20 border-t">
                <Button
                    type="button"
                    variant="third"
                    size="sm"
                    onClick={onRestore}
                    disabled={!isModified}
                    className="gap-1.5 bg-white text-xs"
                >
                    <LuRotateCcw className="size-3.5" aria-hidden="true" />
                    Khôi phục dữ liệu Study4
                </Button>
                <div className="flex sm:flex-row flex-col gap-3">
                    <LinkButton href="/speaking/test" variant="third" size="sm" className="gap-1.5 bg-white text-xs">
                        <LuEye className="size-3.5" aria-hidden="true" />
                        Thử trong phòng thi
                    </LinkButton>
                    <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={onSave}
                        disabled={!isDirty}
                        className="gap-1.5 text-xs"
                    >
                        <LuSave className="size-3.5" aria-hidden="true" />
                        Lưu thay đổi {part.code}
                    </Button>
                </div>
            </div>
        </section>
    );
}
