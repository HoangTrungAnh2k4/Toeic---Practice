'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCircleAlert, LuSave } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { TOPIC_OPTIONS } from '@/lib/exam-library/options';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import {
    emptySpeakingExam,
    SPEAKING_PART_TEMPLATES,
    speakingExamSchema,
    type SpeakingExamInput,
    type SpeakingExamValues,
} from '../../_lib/examSchema';
import FormField from './FormField';
import PartSection from './PartSection';

const EXAM_MANAGEMENT_PATH = '/setting/exam-management';

const TOPIC_ITEMS = TOPIC_OPTIONS.filter((option) => option.value !== 'all');
const NO_LEVEL = 'none';
const LEVEL_ITEMS = [
    { value: NO_LEVEL, label: 'Chưa đặt' },
    ...Array.from({ length: 9 }, (_, index) => ({ value: String(index + 1), label: `Level ${index + 1}` })),
];

/** Lỗi Postgres từ `create_exam` → thông báo cho admin. */
const SAVE_ERROR: Record<string, string> = {
    '42501': 'Tài khoản của bạn không có quyền tạo đề.',
    '22023': 'Cấu trúc đề không khớp 5 Part chuẩn. Vui lòng tải lại trang và thử lại.',
};

export default function ExamBuilderForm() {
    const router = useRouter();
    const form = useForm<SpeakingExamInput, unknown, SpeakingExamValues>({
        resolver: zodResolver(speakingExamSchema),
        defaultValues: emptySpeakingExam(),
    });
    const { register, control, formState } = form;

    const onSubmit = form.handleSubmit(async (values) => {
        const { error } = await supabase.rpc('create_exam', { payload: { ...values, skill: 'speaking' } });
        if (!error) return router.push(`${EXAM_MANAGEMENT_PATH}?created=${encodeURIComponent(values.code)}`);

        if (error.code === '23505') return form.setError('code', { message: 'Mã đề đã tồn tại' }, { shouldFocus: true });
        form.setError('root', { message: SAVE_ERROR[error.code] ?? 'Không lưu được đề. Vui lòng thử lại.' });
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

                    <div className="gap-4 grid sm:grid-cols-[minmax(0,12rem)_1fr]">
                        <FormField label="Mã đề" required error={formState.errors.code?.message}>
                            {(controlProps) => <Input {...controlProps} placeholder="ETS SP-11" {...register('code')} />}
                        </FormField>
                        <FormField label="Tiêu đề" required error={formState.errors.title?.message}>
                            {(controlProps) => <Input {...controlProps} {...register('title')} />}
                        </FormField>
                    </div>

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

                    <FormField label="Mô tả" error={formState.errors.description?.message}>
                        {(controlProps) => <Textarea {...controlProps} rows={2} {...register('description')} />}
                    </FormField>

                    <Controller
                        name="tags"
                        control={control}
                        render={({ field, fieldState }) => (
                            <FormField
                                label="Tag"
                                description="Cách nhau bởi dấu phẩy, ví dụ: Part2-Office, Part5-Opinion."
                                error={fieldState.error?.message ?? fieldState.error?.root?.message}
                            >
                                {(controlProps) => (
                                    <Input
                                        {...controlProps}
                                        ref={field.ref}
                                        name={field.name}
                                        onBlur={field.onBlur}
                                        value={field.value.join(',')}
                                        onChange={(event) => field.onChange(event.target.value.split(','))}
                                    />
                                )}
                            </FormField>
                        )}
                    />
                </section>

                {SPEAKING_PART_TEMPLATES.map((template, index) => (
                    <PartSection key={template.id} template={template} index={index} />
                ))}

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
                        {formState.isSubmitting ? 'Đang lưu...' : 'Lưu nháp'}
                    </Button>
                </div>
            </form>
        </FormProvider>
    );
}
