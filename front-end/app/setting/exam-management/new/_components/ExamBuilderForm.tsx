'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCircleAlert, LuLock, LuSave } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import { TOPIC_OPTIONS } from '@/lib/exam-library/options';
import { cn } from '@/lib/utils';
import { toExamFormData } from '../../_lib/examFormData';
import { emptyExam, examInfoSchema, type ExamInput, examSchema, type ExamValues } from '../../_lib/examSchema';
import FormField from './FormField';
import PartSection from './PartSection';

const EXAM_MANAGEMENT_PATH = '/setting/exam-management';

const TOPIC_ITEMS = TOPIC_OPTIONS.filter((option) => option.value !== 'all');
const NO_LEVEL = 'none';
const LEVEL_ITEMS = [
    { value: NO_LEVEL, label: 'Chưa đặt' },
    ...Array.from({ length: 9 }, (_, index) => ({ value: String(index + 1), label: `Level ${index + 1}` })),
];

/** Mã lỗi từ `POST /api/exams` → thông báo cho admin. */
const SAVE_ERROR: Record<string, string> = {
    unauthorized: 'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.',
    forbidden: 'Tài khoản của bạn không có quyền tạo đề.',
    invalid_structure: 'Cấu trúc đề không khớp khung Part chuẩn. Vui lòng tải lại trang và thử lại.',
    invalid_body: 'Dữ liệu đề không hợp lệ. Vui lòng kiểm tra lại các ô và ảnh.',
    upload_failed: 'Không tải được ảnh lên nên đề chưa được lưu. Vui lòng thử lại.',
    has_attempts: 'Đề vừa có người làm nên chỉ sửa được thông tin chung. Vui lòng tải lại trang.',
    not_found: 'Không tìm thấy đề hoặc bạn không có quyền sửa.',
};

interface ExamBuilderFormProps {
    skill: Skill;
    /** Sửa đề: id đề và giá trị hiện có; bỏ trống là tạo đề mới. */
    exam?: { id: string; values: ExamInput; locked: boolean };
}

export default function ExamBuilderForm({ skill, exam }: ExamBuilderFormProps) {
    const router = useRouter();
    const locked = exam?.locked ?? false;
    const form = useForm<ExamInput, unknown, ExamValues>({
        // Đề đã có lượt làm chỉ kiểm tra thông tin chung: đề cũ thiếu dữ liệu ở Part vẫn đổi tên được. Khi đó giá trị
        // submit chỉ còn thông tin chung, đúng thứ gửi kèm `scope=info`
        resolver: (locked ? zodResolver(examInfoSchema) : zodResolver(examSchema)) as unknown as Resolver<
            ExamInput,
            unknown,
            ExamValues
        >,
        defaultValues: exam?.values ?? emptyExam(skill),
    });
    const { register, control, formState } = form;

    const onSubmit = form.handleSubmit(async (values) => {
        const request = exam
            ? fetch(`/api/exams/${exam.id}`, { method: 'PUT', body: toExamFormData(values, locked ? 'info' : undefined) })
            : fetch('/api/exams', { method: 'POST', body: toExamFormData(values) });
        const response = await request.catch(() => null);
        const body = await response?.json().catch(() => null);
        if (response?.ok) return router.push(`${EXAM_MANAGEMENT_PATH}?${exam ? 'updated' : 'created'}=${body.id}`);

        form.setError('root', { message: SAVE_ERROR[body?.error] ?? 'Không lưu được đề. Vui lòng thử lại.' });
    });

    return (
        <FormProvider {...form}>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
                <section
                    aria-labelledby="general-title"
                    className="flex flex-col gap-5 bg-card shadow-sm p-5 border border-sub2/30 rounded-xl"
                >
                    <h2 id="general-title" className="font-semibold text-main text-base">
                        Thông tin chung
                    </h2>

                    <FormField label="Tiêu đề" required error={formState.errors.title?.message}>
                        {(controlProps) => <Input {...controlProps} {...register('title')} />}
                    </FormField>

                    <div className="gap-4 grid sm:grid-cols-3">
                        <Controller
                            name="topic"
                            control={control}
                            render={({ field, fieldState }) => (
                                <FormField label="Chủ đề" required error={fieldState.error?.message}>
                                    {(controlProps) => (
                                        <Select items={TOPIC_ITEMS} value={field.value} onValueChange={field.onChange}>
                                            <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur} className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {TOPIC_ITEMS.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </FormField>
                            )}
                        />
                        <Controller
                            name="target_level"
                            control={control}
                            render={({ field, fieldState }) => (
                                <FormField label="Level mục tiêu" error={fieldState.error?.message}>
                                    {(controlProps) => (
                                        <Select
                                            items={LEVEL_ITEMS}
                                            value={field.value === null ? NO_LEVEL : String(field.value)}
                                            onValueChange={(value) =>
                                                field.onChange(value === NO_LEVEL ? null : Number(value))
                                            }
                                        >
                                            <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur} className="w-full">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {LEVEL_ITEMS.map((item) => (
                                                    <SelectItem key={item.value} value={item.value}>
                                                        {item.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    )}
                                </FormField>
                            )}
                        />
                        <FormField label="Năm ấn bản" required error={formState.errors.edition?.message}>
                            {(controlProps) => (
                                <Input
                                    {...controlProps}
                                    type="number"
                                    inputMode="numeric"
                                    {...register('edition', { valueAsNumber: true })}
                                />
                            )}
                        </FormField>
                    </div>
                </section>

                {locked && (
                    <p role="note" className="flex items-start gap-2 bg-sub3/15 p-4 border border-sub3/50 rounded-xl text-main text-sm">
                        <LuLock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        Đề đã có người làm nên nội dung các Part bị khoá, để bài làm cũ trong Lịch sử luôn khớp với đề. Muốn đổi
                        nội dung, hãy tạo đề mới.
                    </p>
                )}

                {/* `disabled` khoá mọi ô và nút chọn ảnh bên trong khi đề đã có lượt làm */}
                <fieldset disabled={locked} className="flex flex-col gap-6 disabled:opacity-70 min-w-0">
                    {getPartTemplates(skill).map((template, index) => (
                        <PartSection key={template.id} skill={skill} template={template} index={index} />
                    ))}
                </fieldset>

                {formState.errors.root?.message && (
                    <p role="alert" className="flex items-start gap-2 font-medium text-destructive text-sm">
                        <LuCircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                        {formState.errors.root.message}
                    </p>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                    <Link href={EXAM_MANAGEMENT_PATH} className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'bg-white')}>
                        Hủy
                    </Link>
                    <Button type="submit" variant="primary" size="md" className="gap-2" disabled={formState.isSubmitting}>
                        <LuSave className="size-4" aria-hidden="true" />
                        {formState.isSubmitting ? 'Đang lưu...' : exam ? 'Lưu thay đổi' : 'Lưu nháp'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
