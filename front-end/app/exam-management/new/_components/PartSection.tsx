'use client';

import type { IconType } from 'react-icons';
import { Controller, type FieldErrors, useFormContext, useWatch } from 'react-hook-form';
import { LuCircleAlert, LuCircleCheck, LuCircleDashed, LuClock, LuInfo, LuMailPlus } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { getPartDurationSec } from '@/lib/domain/parts';
import type { PartTemplate, Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { type ExamInput, type ExamValues, getFixedPrompt, getPartFields } from '../../_lib/examSchema';
import FormField from './FormField';
import ImageUploadField from './ImageUploadField';

interface FieldCopy {
    label: string;
    description: string;
}

interface PartCopy {
    prompt: string;
    promptHint?: string;
    context?: FieldCopy;
    stimulus?: FieldCopy;
}

/** Nhãn ô nhập riêng theo Part; ô nào hiện do `getPartFields` quyết định. */
const PART_COPY: Record<Skill, Record<number, PartCopy>> = {
    speaking: {
        1: { prompt: 'Đoạn văn cần đọc', promptHint: 'Thông báo, quảng cáo... khoảng 40–60 từ.' },
        2: { prompt: 'Yêu cầu' },
        3: {
            prompt: 'Câu hỏi',
            context: {
                label: 'Tình huống chung',
                description: 'Đoạn giới thiệu cuộc phỏng vấn, hiển thị trước câu 5–7.',
            },
        },
        4: {
            prompt: 'Câu hỏi',
            context: {
                label: 'Bảng thông tin',
                description: 'Lịch trình, agenda... thí sinh có 45 giây đọc trước câu 8–10. Mỗi dòng một mục.',
            },
        },
        5: { prompt: 'Câu hỏi nêu quan điểm' },
    },
    writing: {
        1: { prompt: 'Yêu cầu' },
        2: {
            prompt: 'Yêu cầu',
            stimulus: {
                label: 'Email',
                description:
                    'Gồm dòng Directions và email (From, To, Subject, nội dung). Xuống dòng được giữ nguyên trong phòng thi.',
            },
        },
        3: {
            prompt: 'Đề bài luận',
            promptHint:
                'Ví dụ: Do you agree or disagree with the following statement? ... Give reasons or examples to support your opinion.',
        },
    },
};

/** Khung email Writing Q6–7 để admin điền tiếp, khỏi gõ lại cấu trúc mỗi lần. */
const EMAIL_TEMPLATE = `Respond to the e-mail as ... Ask TWO questions and make ONE suggestion.

From:
To:
Subject:
Sent:

`;

/** Đếm lỗi lá trong một nhánh `errors` của react-hook-form. */
export function countErrors(errors: unknown): number {
    if (!errors || typeof errors !== 'object') return 0;
    if ('type' in errors && 'message' in errors) return 1;
    return Object.values(errors).reduce<number>((sum, value) => sum + countErrors(value), 0);
}

type QuestionInput = ExamInput['parts'][number]['questions'][number];
export type ItemStatus = 'done' | 'todo' | 'error';

/** Nhãn chữ + icon đi kèm màu: không phân biệt trạng thái chỉ bằng màu. Tránh chữ "N lỗi" để không trùng badge của Part. */
export const ITEM_STATUS: Record<ItemStatus, { label: string; Icon: IconType; className: string }> = {
    done: { label: 'Đã đủ', Icon: LuCircleCheck, className: 'bg-success/45 text-main' },
    todo: { label: 'Chưa xong', Icon: LuCircleDashed, className: 'bg-sub1 text-subText' },
    error: { label: 'Cần sửa', Icon: LuCircleAlert, className: 'bg-destructive/10 text-destructive' },
};

const filled = (text: string | null | undefined) => Boolean(text?.trim());
const countWords = (text: string | null | undefined) => text?.trim().split(/\s+/).filter(Boolean).length ?? 0;

/** Câu đã điền đủ ô bắt buộc chưa. Chỉ để hiện tiến độ; kiểm tra thật (độ dài, trùng từ khoá...) vẫn là `examSchema`. */
export function isQuestionDone(skill: Skill, partNo: number, question: QuestionInput): boolean {
    const fields = getPartFields(skill, partNo);
    return (
        (!fields.prompt || getFixedPrompt(skill, partNo) !== null || filled(question.prompt)) &&
        // Khung email vừa chèn chưa sửa gì thì chưa tính là xong
        (!fields.stimulus || (filled(question.stimulus) && question.stimulus?.trim() !== EMAIL_TEMPLATE.trim())) &&
        (!fields.image || (Boolean(question.image || question.image_path) && filled(question.image_alt))) &&
        (!fields.keywords || question.keywords.every(filled))
    );
}

export function itemStatus(errors: unknown, done: boolean): ItemStatus {
    return countErrors(errors) > 0 ? 'error' : done ? 'done' : 'todo';
}

const formatDuration = (sec: number) => (sec % 60 === 0 ? `${sec / 60} phút` : `${sec} giây`);

interface PartSectionProps {
    skill: Skill;
    template: PartTemplate;
    index: number;
}

export default function PartSection({ skill, template, index }: PartSectionProps) {
    const { register, control, getFieldState, formState, setValue } = useFormContext<ExamInput, unknown, ExamValues>();
    const part = useWatch({ control, name: `parts.${index}` });
    const partErrors = (formState.errors.parts as FieldErrors<ExamInput['parts']> | undefined)?.[index];
    const errorCount = countErrors(partErrors);
    const copy = PART_COPY[skill][template.part_no];
    const fields = getPartFields(skill, template.part_no);
    const fixedPrompt = getFixedPrompt(skill, template.part_no);
    const errorOf = (name: Parameters<typeof getFieldState>[0]) => getFieldState(name, formState).error?.message;
    const titleId = `part-${template.part_no}-title`;
    const duration = getPartDurationSec(template);
    const isWriting = skill === 'writing';
    const meta = [
        template.q_from === template.q_to
            ? `Câu ${template.q_from}`
            : `Câu ${template.q_from}–${template.q_to} · ${part.questions.length} câu`,
        duration && formatDuration(duration),
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <section aria-labelledby={titleId} className="flex flex-col gap-4">
            <header className="flex flex-wrap justify-between items-center gap-3 bg-main shadow-main/20 shadow-md p-5 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0">
                    <span
                        className="flex justify-center items-center bg-sub3 rounded-lg size-11 font-bold tabular-nums text-main text-lg shrink-0"
                        aria-hidden="true"
                    >
                        {template.part_no}
                    </span>
                    <div className="flex flex-col gap-0.5 min-w-0">
                        <h2 id={titleId} className="font-bold text-white text-lg tracking-tight">
                            <span className="sr-only">Part {template.part_no} · </span>
                            {template.task}
                        </h2>
                        <p className="inline-flex items-center gap-1.5 font-medium text-sub1 text-sm">
                            <LuClock className="size-3.5 text-sub3" aria-hidden="true" />
                            {meta}
                        </p>
                    </div>
                </div>
                {errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-white px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-destructive tracking-wider">
                        <LuCircleAlert className="size-3.5" aria-hidden="true" />
                        {errorCount} lỗi
                    </span>
                )}
            </header>

            {errorOf(`parts.${index}.questions`) && (
                <p role="alert" className="font-medium text-destructive text-sm">
                    {errorOf(`parts.${index}.questions`)}
                </p>
            )}

            {fixedPrompt && (
                <p className="flex items-start gap-2.5 bg-card px-4 py-3 border border-sub2/30 rounded-xl font-medium text-main text-sm">
                    <LuInfo className="mt-0.5 size-4 text-sub2 shrink-0" aria-hidden="true" />
                    <span>
                        <span className="font-semibold">{copy.prompt} cố định cho mọi câu:</span>{' '}
                        <span className="italic">{fixedPrompt}</span>
                    </span>
                </p>
            )}

            {fields.context && copy.context && (
                <div
                    id={`part-${template.part_no}-context`}
                    className="bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
                >
                    <FormField
                        label={copy.context.label}
                        required
                        description={copy.context.description}
                        error={errorOf(`parts.${index}.context`)}
                    >
                        {(control) => (
                            <Textarea {...control} className="min-h-28" {...register(`parts.${index}.context`)} />
                        )}
                    </FormField>
                </div>
            )}

            {part.questions.map((question, questionIndex) => {
                const name = `parts.${index}.questions.${questionIndex}` as const;
                const status =
                    ITEM_STATUS[
                        itemStatus(
                            (partErrors?.questions as unknown[] | undefined)?.[questionIndex],
                            isQuestionDone(skill, template.part_no, question),
                        )
                    ];
                const sampleWords = countWords(question.sample_answer);

                const promptField = fields.prompt && !fixedPrompt && (
                    <FormField
                        label={copy.prompt}
                        required
                        description={copy.promptHint}
                        error={errorOf(`${name}.prompt`)}
                    >
                        {(control) => (
                            <Textarea
                                {...control}
                                className={skill === 'speaking' && template.part_no === 1 ? 'min-h-28' : 'min-h-20'}
                                {...register(`${name}.prompt`)}
                            />
                        )}
                    </FormField>
                );

                const sampleField = fields.sample && (
                    <FormField
                        label="Bài mẫu"
                        description={isWriting && sampleWords > 0 ? `${sampleWords} từ` : undefined}
                        error={errorOf(`${name}.sample_answer`)}
                    >
                        {(control) => (
                            <Textarea
                                {...control}
                                className={isWriting && template.part_no > 1 ? 'min-h-48' : 'min-h-20'}
                                {...register(`${name}.sample_answer`)}
                            />
                        )}
                    </FormField>
                );

                return (
                    <fieldset
                        key={question.number}
                        id={`question-${question.number}`}
                        className="relative flex flex-col gap-5 bg-card shadow-sm hover:shadow-md p-5 sm:p-6 border border-sub2/30 focus-within:border-sub2/70 rounded-xl transition-[box-shadow,border-color]"
                    >
                        <legend className="float-left flex items-center gap-2.5 w-full font-semibold text-main text-base">
                            <span
                                className="flex justify-center items-center bg-sub3 rounded-full size-8 font-bold tabular-nums text-main text-sm"
                                aria-hidden="true"
                            >
                                {question.number}
                            </span>
                            Câu {question.number}
                        </legend>
                        <span
                            className={cn(
                                'top-6 sm:top-7 right-5 sm:right-6 absolute inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] tracking-wider',
                                status.className,
                            )}
                        >
                            <status.Icon className="size-3.5" aria-hidden="true" />
                            {status.label}
                        </span>

                        {fields.image ? (
                            // Cột trái là thứ thí sinh thấy (tranh + từ khoá dưới tranh), cột phải là dữ liệu cho AI chấm
                            <div className="items-start gap-5 grid xl:grid-cols-2">
                                <div className="flex flex-col gap-4">
                                    <Controller
                                        name={`${name}.image`}
                                        control={control}
                                        render={({ field, fieldState }) => (
                                            <FormField label="Ảnh" required error={fieldState.error?.message}>
                                                {(controlProps) => (
                                                    <ImageUploadField
                                                        control={controlProps}
                                                        value={field.value}
                                                        existingUrl={question.image_path}
                                                        alt={`Ảnh câu ${question.number}`}
                                                        onChange={field.onChange}
                                                        onRemoveExisting={() =>
                                                            setValue(`${name}.image_path`, null, {
                                                                shouldDirty: true,
                                                                shouldValidate: formState.isSubmitted,
                                                            })
                                                        }
                                                        onBlur={field.onBlur}
                                                    />
                                                )}
                                            </FormField>
                                        )}
                                    />

                                    {fields.keywords && (
                                        <fieldset className="flex flex-col gap-3 bg-canvas/60 p-4 border border-sub2/30 rounded-xl">
                                            <legend className="float-left w-full font-semibold text-main text-sm">
                                                Từ khoá dưới tranh <span className="text-destructive">*</span>
                                            </legend>
                                            <div className="gap-3 grid grid-cols-2">
                                                {question.keywords.map((_, keywordIndex) => (
                                                    <FormField
                                                        key={keywordIndex}
                                                        label={`Từ khoá ${keywordIndex + 1}`}
                                                        hideLabel
                                                        error={errorOf(`${name}.keywords.${keywordIndex}`)}
                                                    >
                                                        {(control) => (
                                                            <Input
                                                                {...control}
                                                                className="bg-white font-semibold text-main text-center"
                                                                {...register(`${name}.keywords.${keywordIndex}`)}
                                                            />
                                                        )}
                                                    </FormField>
                                                ))}
                                            </div>
                                            {errorOf(`${name}.keywords`) && (
                                                <p role="alert" className="font-medium text-destructive text-sm">
                                                    {errorOf(`${name}.keywords`)}
                                                </p>
                                            )}
                                        </fieldset>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    {promptField}
                                    <FormField
                                        label="Mô tả ảnh"
                                        required
                                        error={errorOf(`${name}.image_alt`)}
                                    >
                                        {(control) => (
                                            <Textarea
                                                {...control}
                                                className="min-h-40"
                                                placeholder="Tả bằng tiếng Anh, càng chi tiết càng tốt. Ví dụ: Two women are sitting at a café table by the window. One is holding a cup, the other is reading a menu..."
                                                {...register(`${name}.image_alt`)}
                                            />
                                        )}
                                    </FormField>
                                    {sampleField}
                                </div>
                            </div>
                        ) : (
                            <>
                                {promptField}
                                {fields.stimulus && copy.stimulus && (
                                    <div className="flex flex-col gap-3">
                                        <FormField
                                            label={copy.stimulus.label}
                                            required
                                            description={copy.stimulus.description}
                                            error={errorOf(`${name}.stimulus`)}
                                        >
                                            {(control) => (
                                                <Textarea
                                                    {...control}
                                                    className="min-h-72"
                                                    {...register(`${name}.stimulus`)}
                                                />
                                            )}
                                        </FormField>
                                        {!filled(question.stimulus) && (
                                            <Button
                                                type="button"
                                                variant="third"
                                                size="sm"
                                                className="self-start gap-2 bg-white"
                                                onClick={() =>
                                                    setValue(`${name}.stimulus`, EMAIL_TEMPLATE, {
                                                        shouldDirty: true,
                                                        shouldValidate: formState.isSubmitted,
                                                    })
                                                }
                                            >
                                                <LuMailPlus className="size-4" aria-hidden="true" />
                                                Chèn khung email
                                            </Button>
                                        )}
                                    </div>
                                )}
                                {sampleField}
                            </>
                        )}
                    </fieldset>
                );
            })}
        </section>
    );
}
