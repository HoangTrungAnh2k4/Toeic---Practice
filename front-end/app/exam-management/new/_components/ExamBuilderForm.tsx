'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { type FieldErrors, FormProvider, type Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuCircleAlert, LuCircleCheck, LuLock, LuSave } from 'react-icons/lu';
import { SegmentedTabs } from '@/components/segmented-tabs';
import Button, { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { toExamFormData } from '../../_lib/examFormData';
import { emptyExam, examInfoSchema, type ExamInput, examSchema, type ExamValues } from '../../_lib/examSchema';
import FormField from './FormField';
import PartSection, { countErrors } from './PartSection';

const EXAM_MANAGEMENT_PATH = '/exam-management';

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
    const { register, formState } = form;
    const templates = getPartTemplates(skill);
    const [activeIndex, setActiveIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);

    const errorCounts = templates.map((_, index) =>
        countErrors((formState.errors.parts as FieldErrors<ExamInput['parts']> | undefined)?.[index]),
    );
    const totalErrors = errorCounts.reduce((sum, count) => sum + count, 0);
    const partTabs = templates.map((template) => ({ value: String(template.part_no), label: `Part ${template.part_no}` }));
    const questionCounts = Object.fromEntries(
        templates.map((template) => [String(template.part_no), template.q_to - template.q_from + 1]),
    );

    /** Đang cuộn sâu trong Part dài mà đổi Part thì cuộn lên đầu cột nội dung, không thì rơi giữa/cuối Part mới. */
    const goToPart = (index: number) => {
        setActiveIndex(index);
        // 'instant': Part mới ngắn hơn làm trang co lại, trình duyệt huỷ smooth scroll (html đang để smooth) giữa chừng
        if ((contentRef.current?.getBoundingClientRect().top ?? 0) < 0) {
            contentRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' });
        }
    };

    const onSubmit = form.handleSubmit(
        async (values) => {
            const request = exam
                ? fetch(`/api/exams/${exam.id}`, { method: 'PUT', body: toExamFormData(values, locked ? 'info' : undefined) })
                : fetch('/api/exams', { method: 'POST', body: toExamFormData(values) });
            const response = await request.catch(() => null);
            const body = await response?.json().catch(() => null);
            if (response?.ok) return router.push(`${EXAM_MANAGEMENT_PATH}?${exam ? 'updated' : 'created'}=${body.id}`);

            form.setError('root', { message: SAVE_ERROR[body?.error] ?? 'Không lưu được đề. Vui lòng thử lại.' });
        },
        (errors) => {
            // Thông tin chung luôn hiện nên react-hook-form tự focus được; lỗi chỉ ở Part thì mở Part đó để nó focus vào
            if (errors.title) return;
            const parts = errors.parts as FieldErrors<ExamInput['parts']> | undefined;
            const firstInvalid = templates.findIndex((_, index) => countErrors(parts?.[index]) > 0);
            if (firstInvalid >= 0) setActiveIndex(firstInvalid);
        },
    );

    return (
        <FormProvider {...form}>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
                <div className="items-start gap-6 grid lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
                    <aside className="lg:top-6 lg:sticky flex flex-col gap-4">
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
                        </section>

                        {/* Mục lục Part: trên mobile đã có thanh tab nên ẩn cho gọn */}
                        <nav
                            aria-label="Cấu trúc đề"
                            className="max-lg:hidden flex flex-col gap-1 bg-card shadow-sm p-3 border border-sub2/30 rounded-xl"
                        >
                            <p className="px-2 pt-1 pb-2 font-semibold text-[0.6875rem] text-subText uppercase tracking-wider">
                                Cấu trúc đề
                            </p>
                            {templates.map((template, index) => {
                                const isActive = index === activeIndex;
                                return (
                                    <button
                                        key={template.id}
                                        type="button"
                                        aria-current={isActive ? 'step' : undefined}
                                        onClick={() => goToPart(index)}
                                        className={cn(
                                            'flex items-center gap-3 p-2 rounded-lg text-left transition-colors cursor-pointer',
                                            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                            isActive ? 'bg-canvas' : 'hover:bg-sub1/50',
                                        )}
                                    >
                                        <span
                                            className={cn(
                                                'flex justify-center items-center rounded-md size-7 font-bold tabular-nums text-xs transition-colors shrink-0',
                                                isActive ? 'bg-main text-sub3' : 'bg-sub1 text-main',
                                            )}
                                            aria-hidden="true"
                                        >
                                            {template.part_no}
                                        </span>
                                        <span className="flex flex-col min-w-0">
                                            <span className="font-semibold text-main text-sm truncate">
                                                <span className="sr-only">Part {template.part_no}: </span>
                                                {template.task}
                                            </span>
                                            <span className="font-medium text-subText text-xs">
                                                Câu {template.q_from}
                                                {template.q_to > template.q_from && `–${template.q_to}`}
                                            </span>
                                        </span>
                                        {errorCounts[index] > 0 && (
                                            <span className="inline-flex items-center gap-1 ml-auto font-semibold text-destructive text-xs shrink-0">
                                                <LuCircleAlert className="size-3.5" aria-hidden="true" />
                                                {errorCounts[index]}
                                                <span className="sr-only">lỗi</span>
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </nav>
                    </aside>

                    <div ref={contentRef} className="flex flex-col gap-4 min-w-0 scroll-mt-20 md:scroll-mt-6">
                        {locked && (
                            <p
                                role="note"
                                className="flex items-start gap-2 bg-sub3/15 p-4 border border-sub3/50 rounded-xl text-main text-sm"
                            >
                                <LuLock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                                Đề đã có người làm nên nội dung các Part bị khoá, để bài làm cũ trong Lịch sử luôn khớp với đề.
                                Muốn đổi nội dung, hãy tạo đề mới.
                            </p>
                        )}

                        <div className="sm:hidden top-20 sticky flex flex-wrap justify-between items-center gap-3">
                            <SegmentedTabs
                                options={partTabs}
                                value={partTabs[activeIndex].value}
                                onChange={(value) => goToPart(partTabs.findIndex((tab) => tab.value === value))}
                                counts={questionCounts}
                                ariaLabel="Chuyển Part"
                            />
                            <span className="font-medium tabular-nums text-subText text-xs">
                                Part {activeIndex + 1}/{templates.length}
                            </span>
                        </div>

                        {/* `disabled` khoá mọi ô và nút chọn ảnh bên trong khi đề đã có lượt làm */}
                        <fieldset disabled={locked} className="disabled:opacity-70 min-w-0">
                            {/* Part ẩn vẫn mount để giữ ảnh xem trước và để react-hook-form kiểm tra đủ mọi Part */}
                            {templates.map((template, index) => (
                                <div key={template.id} hidden={index !== activeIndex} className="motion-safe:animate-rise">
                                    <PartSection skill={skill} template={template} index={index} />
                                </div>
                            ))}
                        </fieldset>
                    </div>
                </div>

                <div className="flex flex-wrap justify-between items-center gap-3 bg-main shadow-lg backdrop-blur-sm px-4 py-3 border border-sub2/30 rounded-xl">
                    {formState.errors.root?.message ? (
                        <p role="alert" className="flex items-start gap-2 font-medium text-destructive text-sm">
                            <LuCircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            {formState.errors.root.message}
                        </p>
                    ) : formState.isSubmitted && totalErrors > 0 ? (
                        <p className="flex items-center gap-2 font-medium text-destructive text-sm" aria-live="polite">
                            <LuCircleAlert aria-hidden="true" className="size-4 shrink-0" />
                            Còn {totalErrors} ô cần sửa ở các Part
                        </p>
                    ) : (
                        <p className="flex items-center gap-2 font-medium text-white text-sm">
                            <LuCircleCheck aria-hidden="true" className="size-4 text-success shrink-0" />
                            {exam ? 'Lưu thay đổi không đổi trạng thái của đề.' : 'Đề được lưu dạng nháp, sửa lại được sau.'}
                        </p>
                    )}
                    <div className="flex gap-3 ml-auto">
                        <Link
                            href={EXAM_MANAGEMENT_PATH}
                            className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'bg-white')}
                        >
                            Hủy
                        </Link>
                        <Button type="submit" variant="primary" size="md" className="gap-2" disabled={formState.isSubmitting}>
                            <LuSave className="size-4" aria-hidden="true" />
                            {formState.isSubmitting ? 'Đang lưu...' : exam ? 'Lưu thay đổi' : 'Lưu nháp'}
                        </Button>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}
