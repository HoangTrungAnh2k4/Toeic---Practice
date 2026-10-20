'use client';

import { Controller, type FieldErrors, useFormContext } from 'react-hook-form';
import { LuCircleAlert } from 'react-icons/lu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import type { PartTemplate, Skill } from '@/lib/domain/types';
import { type ExamInput, type ExamValues, getPartFields } from '../../_lib/examSchema';
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
    2: { prompt: 'Yêu cầu', promptHint: 'Ví dụ: Describe the picture in as much detail as you can.' },
    3: {
        prompt: 'Câu hỏi',
        context: { label: 'Tình huống chung', description: 'Đoạn giới thiệu cuộc phỏng vấn, hiển thị trước câu 5–7.' },
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
        1: { prompt: 'Yêu cầu', promptHint: 'Đã điền sẵn yêu cầu chuẩn ETS, thường giữ nguyên.' },
        2: {
            prompt: 'Yêu cầu (Directions)',
            promptHint: 'Ví dụ: Respond to the e-mail as the office manager. Ask TWO questions and make ONE suggestion.',
            stimulus: {
                label: 'Email',
                description: 'Dán nguyên email gồm From, To, Subject và nội dung. Xuống dòng được giữ nguyên trong phòng thi.',
            },
        },
        3: {
            prompt: 'Đề bài luận',
            promptHint:
                'Ví dụ: Do you agree or disagree with the following statement? ... Give reasons or examples to support your opinion.',
        },
    },
};

/** Đếm lỗi lá trong một nhánh `errors` của react-hook-form. */
function countErrors(errors: unknown): number {
    if (!errors || typeof errors !== 'object') return 0;
    if ('type' in errors && 'message' in errors) return 1;
    return Object.values(errors).reduce<number>((sum, value) => sum + countErrors(value), 0);
}

interface PartSectionProps {
    skill: Skill;
    template: PartTemplate;
    index: number;
}

export default function PartSection({ skill, template, index }: PartSectionProps) {
    const { register, control, getFieldState, formState, getValues } = useFormContext<ExamInput, unknown, ExamValues>();
    const partErrors = (formState.errors.parts as FieldErrors<ExamInput['parts']> | undefined)?.[index];
    const errorCount = countErrors(partErrors);
    const copy = PART_COPY[skill][template.part_no];
    const fields = getPartFields(skill, template.part_no);
    const questions = getValues(`parts.${index}.questions`);
    const errorOf = (name: Parameters<typeof getFieldState>[0]) => getFieldState(name, formState).error?.message;
    const titleId = `part-${template.part_no}-title`;

    return (
        <section
            aria-labelledby={titleId}
            className="relative flex flex-col gap-5 bg-card shadow-sm hover:shadow-md p-5 pl-7 border border-sub2/30 rounded-xl overflow-hidden transition-shadow"
        >
            <span className="left-0 absolute inset-y-0 bg-main w-1.5" aria-hidden="true" />

            <header className="flex flex-wrap justify-between items-start gap-2">
                <div className="flex flex-col gap-0.5">
                    <h2 id={titleId} className="font-semibold text-main text-base">
                        Part {template.part_no} · {template.task}
                    </h2>

                </div>
                {errorCount > 0 && (
                    <span className="inline-flex items-center gap-1 bg-destructive/10 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] text-destructive tracking-wider">
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

            {fields.context && copy.context && (
                <FormField
                    label={copy.context.label}
                    required
                    description={copy.context.description}
                    error={errorOf(`parts.${index}.context`)}
                >
                    {(control) => <Textarea {...control} rows={5} {...register(`parts.${index}.context`)} />}
                </FormField>
            )}

            {questions.map((question, questionIndex) => {
                const name = `parts.${index}.questions.${questionIndex}` as const;
                return (
                    <fieldset key={question.number} className="flex flex-col gap-4 pt-4 border-sub2/30 border-t">
                        <legend className="float-left mb-1 font-semibold text-main text-sm">Câu {question.number}</legend>

                        <FormField
                            label={copy.prompt}
                            required
                            description={copy.promptHint}
                            error={errorOf(`${name}.prompt`)}
                        >
                            {(control) => (
                                <Textarea
                                    {...control}
                                    rows={skill === 'speaking' && template.part_no === 1 ? 4 : 2}
                                    {...register(`${name}.prompt`)}
                                />
                            )}
                        </FormField>

                        {fields.stimulus && copy.stimulus && (
                            <FormField
                                label={copy.stimulus.label}
                                required
                                description={copy.stimulus.description}
                                error={errorOf(`${name}.stimulus`)}
                            >
                                {(control) => <Textarea {...control} rows={8} {...register(`${name}.stimulus`)} />}
                            </FormField>
                        )}

                        {fields.image && (
                            <>
                                <Controller
                                    name={`${name}.image`}
                                    control={control}
                                    render={({ field, fieldState }) => (
                                        <FormField label="Ảnh" required error={fieldState.error?.message}>
                                            {(controlProps) => (
                                                <ImageUploadField
                                                    control={controlProps}
                                                    value={field.value}
                                                    alt={`Ảnh câu ${question.number}`}
                                                    onChange={field.onChange}
                                                    onBlur={field.onBlur}
                                                />
                                            )}
                                        </FormField>
                                    )}
                                />
                                <FormField
                                    label="Mô tả ảnh"
                                    required
                                    description="Tả chi tiết bằng tiếng Anh: số người, vị trí, trang phục, hành động, đồ vật, bối cảnh. AI chấm điểm dựa trên mô tả này, trình đọc màn hình cũng đọc nó."
                                    error={errorOf(`${name}.image_alt`)}
                                >
                                    {(control) => <Textarea {...control} rows={5} {...register(`${name}.image_alt`)} />}
                                </FormField>
                            </>
                        )}

                        {fields.keywords && (
                            <fieldset className="flex flex-col gap-2">
                                <legend className="mb-2 font-semibold text-main text-sm">
                                    Từ khoá bắt buộc <span className="text-destructive">*</span>
                                </legend>
                                <p className="font-medium text-subText text-xs">
                                    Chỉ nhập từ gốc. AI tự chấm việc dùng từ ở mọi dạng (số nhiều, chia thì) và đúng nghĩa.
                                </p>
                                <div className="gap-3 grid sm:grid-cols-2">
                                    {question.keywords.map((_, keywordIndex) => (
                                        <FormField
                                            key={keywordIndex}
                                            label={`Từ khoá ${keywordIndex + 1}`}
                                            error={errorOf(`${name}.keywords.${keywordIndex}`)}
                                        >
                                            {(control) => <Input {...control} {...register(`${name}.keywords.${keywordIndex}`)} />}
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

                        <FormField label="Bài mẫu" error={errorOf(`${name}.sample_answer`)}>
                            {(control) => <Textarea {...control} rows={2} {...register(`${name}.sample_answer`)} />}
                        </FormField>
                    </fieldset>
                );
            })}
        </section>
    );
}
