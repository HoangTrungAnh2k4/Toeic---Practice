'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type FormEvent, useRef, useState } from 'react';
import { type FieldErrors, FormProvider, type Resolver, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LuArrowLeft, LuArrowRight, LuCheck, LuCircleAlert, LuCircleCheck, LuLock, LuSave } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { getPartTemplates } from '@/lib/domain/parts';
import type { Skill } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { toExamFormData } from '../../_lib/examFormData';
import {
    emptyExam,
    examInfoSchema,
    type ExamInput,
    examSchema,
    type ExamValues,
    getPartFields,
} from '../../_lib/examSchema';
import FormField from './FormField';
import PartSection, { countErrors, isQuestionDone, ITEM_STATUS, type ItemStatus, itemStatus } from './PartSection';

const EXAM_MANAGEMENT_PATH = '/exam-management';
/** Header mobile (`h-14` trong sidebar.tsx) che đầu trang khi thanh công cụ không dính. */
const MOBILE_HEADER_PX = 56;

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
    const { register, formState, control } = form;
    const parts = useWatch({ control, name: 'parts' });
    const templates = getPartTemplates(skill);
    const [activeIndex, setActiveIndex] = useState(0);
    const contentRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const partErrors = formState.errors.parts as FieldErrors<ExamInput['parts']> | undefined;
    const outline = templates.map((template, index) => {
        const errors = partErrors?.[index];
        const questions = parts[index].questions.map((question, questionIndex) => ({
            number: question.number,
            status: itemStatus(
                (errors?.questions as unknown[] | undefined)?.[questionIndex],
                isQuestionDone(skill, template.part_no, question),
            ),
        }));
        const context: ItemStatus | null = getPartFields(skill, template.part_no).context
            ? itemStatus(errors?.context, Boolean(parts[index].context?.trim()))
            : null;
        const done = questions.filter((question) => question.status === 'done').length;
        return {
            questions,
            context,
            done,
            complete: done === questions.length && (context === null || context === 'done'),
            errorCount: countErrors(errors),
        };
    });
    const totalErrors = outline.reduce((sum, part) => sum + part.errorCount, 0);
    const doneCount = outline.reduce((sum, part) => sum + part.done, 0);
    const questionTotal = outline.reduce((sum, part) => sum + part.questions.length, 0);

    /** Khoảng bị che ở đầu màn hình: thanh công cụ khi nó dính (desktop), không thì header mobile. */
    const coveredTop = () => {
        const bar = toolbarRef.current;
        return bar && getComputedStyle(bar).position === 'sticky' ? bar.offsetHeight : MOBILE_HEADER_PX;
    };
    const scrollToElement = (element: HTMLElement | null, behavior: ScrollBehavior) => {
        if (element) window.scrollBy({ top: element.getBoundingClientRect().top - coveredTop() - 12, behavior });
    };

    /** Đang cuộn sâu trong Part dài mà đổi Part thì cuộn lên đầu cột nội dung, không thì rơi giữa/cuối Part mới. */
    const goToPart = (index: number) => {
        setActiveIndex(index);
        // 'instant': Part mới ngắn hơn làm trang co lại, trình duyệt huỷ smooth scroll (html đang để smooth) giữa chừng
        if ((contentRef.current?.getBoundingClientRect().top ?? 0) < coveredTop()) {
            scrollToElement(contentRef.current, 'instant');
        }
    };

    /** Nhảy tới một câu (có thể ở Part đang ẩn): đổi Part trước, đợi render xong mới cuộn được. */
    const goToItem = (partIndex: number, elementId: string) => {
        setActiveIndex(partIndex);
        requestAnimationFrame(() => scrollToElement(document.getElementById(elementId), 'smooth'));
    };

    // Gọi handleSubmit trong sự kiện: callback lỗi đọc ref (cuộn tới Part), không được chạy lúc render
    const onSubmit = (event: FormEvent<HTMLFormElement>) =>
        form.handleSubmit(
            async (values) => {
                const request = exam
                    ? fetch(`/api/exams/${exam.id}`, {
                          method: 'PUT',
                          body: toExamFormData(values, locked ? 'info' : undefined),
                      })
                    : fetch('/api/exams', { method: 'POST', body: toExamFormData(values) });
                const response = await request.catch(() => null);
                const body = await response?.json().catch(() => null);
                if (response?.ok)
                    return router.push(`${EXAM_MANAGEMENT_PATH}?${exam ? 'updated' : 'created'}=${body.id}`);

                form.setError('root', { message: SAVE_ERROR[body?.error] ?? 'Không lưu được đề. Vui lòng thử lại.' });
            },
            (errors) => {
                // Thông tin chung luôn hiện nên react-hook-form tự focus được; lỗi chỉ ở Part thì mở Part đó để nó focus vào
                if (errors.title) return;
                const invalidParts = errors.parts as FieldErrors<ExamInput['parts']> | undefined;
                const firstInvalid = templates.findIndex((_, index) => countErrors(invalidParts?.[index]) > 0);
                if (firstInvalid >= 0) goToPart(firstInvalid);
            },
        )(event);

    const nextTemplate = templates[activeIndex + 1];
    const prevTemplate = templates[activeIndex - 1];

    return (
        <FormProvider {...form}>
            <form noValidate onSubmit={onSubmit} className="flex flex-col gap-6">
                {/* Thanh công cụ dính trên desktop: tên đề, tiến độ và nút lưu luôn trong tầm tay khi cuộn */}
                <div ref={toolbarRef} className="md:top-0 z-10 md:sticky -mt-4 pt-4 pb-2 bg-canvas">
                    <div className="flex flex-wrap items-end gap-x-6 gap-y-4 bg-card shadow-sm px-4 sm:px-5 py-4 border border-sub2/30 rounded-xl">
                        <div className="flex-1 min-w-64 max-w-md">
                            <FormField label="Tiêu đề" required error={formState.errors.title?.message}>
                                {(controlProps) => (
                                    <Input
                                        {...controlProps}
                                        placeholder={`Ví dụ: ${skill === 'writing' ? 'Writing' : 'Speaking'} Practice Test 01`}
                                        className="font-semibold text-main"
                                        {...register('title')}
                                    />
                                )}
                            </FormField>
                        </div>

                        <div className="flex flex-col gap-2 pb-1 w-full sm:w-48">
                            <p className="flex justify-between items-center font-medium text-main text-sm">
                                <span className="flex items-center gap-1.5">
                                    {doneCount === questionTotal && (
                                        <LuCircleCheck className="size-4 text-success" aria-hidden="true" />
                                    )}
                                    Đã điền
                                </span>
                                <span className="font-semibold tabular-nums">
                                    {doneCount}/{questionTotal} câu
                                </span>
                            </p>
                            <Progress
                                value={Math.round((doneCount / questionTotal) * 100)}
                                aria-label="Tiến độ điền đề"
                                className="**:data-[slot=progress-indicator]:bg-success **:data-[slot=progress-track]:bg-sub1 **:data-[slot=progress-track]:h-2"
                            />
                        </div>

                        <div className="flex gap-3 sm:ml-auto">
                            <Link
                                href={EXAM_MANAGEMENT_PATH}
                                className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'bg-white')}
                            >
                                Hủy
                            </Link>
                            <Button
                                type="submit"
                                variant="primary"
                                size="md"
                                className="gap-2"
                                disabled={formState.isSubmitting}
                            >
                                <LuSave className="size-4" aria-hidden="true" />
                                {formState.isSubmitting ? 'Đang lưu...' : exam ? 'Lưu thay đổi' : 'Lưu nháp'}
                            </Button>
                        </div>

                        {formState.errors.root?.message ? (
                            <p
                                role="alert"
                                className="flex items-start gap-2 w-full font-medium text-destructive text-sm"
                            >
                                <LuCircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                                {formState.errors.root.message}
                            </p>
                        ) : (
                            formState.isSubmitted &&
                            totalErrors > 0 && (
                                <p
                                    role="alert"
                                    className="flex items-center gap-2 w-full font-medium text-destructive text-sm"
                                >
                                    <LuCircleAlert aria-hidden="true" className="size-4 shrink-0" />
                                    Còn {totalErrors} ô cần sửa, bấm câu có dấu “Cần sửa” ở cột trái để tới thẳng ô đó.
                                </p>
                            )
                        )}
                    </div>
                </div>

                <div className="items-start gap-6 grid lg:grid-cols-[18rem_minmax(0,1fr)]">
                    <aside className="lg:top-36 lg:sticky min-w-0">
                        <nav
                            aria-label="Cấu trúc đề"
                            className="flex lg:flex-col gap-1 bg-card shadow-sm p-2 lg:p-3 border border-sub2/30 rounded-xl max-lg:overflow-x-auto"
                        >
                            <p className="max-lg:hidden px-2 pt-1 pb-2 font-semibold text-[0.6875rem] text-subText uppercase tracking-wider">
                                Cấu trúc đề
                            </p>
                            {templates.map((template, index) => {
                                const isActive = index === activeIndex;
                                const { questions, context, done, complete, errorCount } = outline[index];
                                return (
                                    <div
                                        key={template.id}
                                        className={cn(
                                            'flex flex-col gap-2 p-1 rounded-lg transition-colors shrink-0',
                                            isActive && 'bg-canvas',
                                        )}
                                    >
                                        <button
                                            type="button"
                                            aria-current={isActive ? 'step' : undefined}
                                            onClick={() => goToPart(index)}
                                            className={cn(
                                                'flex items-center gap-3 p-1.5 rounded-lg text-left transition-colors cursor-pointer',
                                                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                                                !isActive && 'hover:bg-sub1/50',
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    'flex justify-center items-center rounded-md size-8 font-bold tabular-nums text-sm transition-colors shrink-0',
                                                    isActive ? 'bg-main text-sub3' : 'bg-sub1 text-main',
                                                )}
                                                aria-hidden="true"
                                            >
                                                {template.part_no}
                                            </span>
                                            <span className="flex flex-col min-w-0">
                                                <span className="font-semibold text-main text-sm max-lg:whitespace-nowrap">
                                                    <span className="sr-only">Part {template.part_no}: </span>
                                                    <span className="lg:hidden" aria-hidden="true">
                                                        Part {template.part_no}
                                                    </span>
                                                    <span className="max-lg:sr-only">{template.task}</span>
                                                </span>
                                                <span className="font-medium tabular-nums text-subText text-xs whitespace-nowrap">
                                                    {done}/{questions.length} câu
                                                </span>
                                            </span>
                                            {errorCount > 0 ? (
                                                <span className="inline-flex items-center gap-1 ml-auto font-semibold text-destructive text-xs shrink-0">
                                                    <LuCircleAlert className="size-4" aria-hidden="true" />
                                                    {errorCount}
                                                    <span className="sr-only">lỗi</span>
                                                </span>
                                            ) : (
                                                complete && (
                                                    <span className="flex justify-center items-center bg-success ml-auto rounded-full size-5 text-main shrink-0">
                                                        <LuCheck className="size-3.5" strokeWidth={3} aria-hidden="true" />
                                                        <span className="sr-only">đã đủ</span>
                                                    </span>
                                                )
                                            )}
                                        </button>

                                        {/* Link chứ không phải nút: nhảy tới vị trí trong trang, giữ nav chỉ có nút đổi Part */}
                                        <ol
                                            aria-label={`Các câu Part ${template.part_no}`}
                                            className="max-lg:hidden flex flex-wrap gap-1.5 px-1.5 pb-1.5"
                                        >
                                            {context && (
                                                <li>
                                                    <StatusChip
                                                        href={`#part-${template.part_no}-context`}
                                                        label="Ngữ liệu"
                                                        status={context}
                                                        onClick={() =>
                                                            goToItem(index, `part-${template.part_no}-context`)
                                                        }
                                                    />
                                                </li>
                                            )}
                                            {questions.map((question) => (
                                                <li key={question.number}>
                                                    <StatusChip
                                                        href={`#question-${question.number}`}
                                                        label={String(question.number)}
                                                        srLabel={`Câu ${question.number}`}
                                                        status={question.status}
                                                        onClick={() => goToItem(index, `question-${question.number}`)}
                                                    />
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                );
                            })}
                        </nav>
                    </aside>

                    <div ref={contentRef} className="flex flex-col gap-4 min-w-0">
                        {locked && (
                            <p
                                role="note"
                                className="flex items-start gap-2 bg-sub3/15 p-4 border border-sub3/50 rounded-xl text-main text-sm"
                            >
                                <LuLock aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                                Đề đã có người làm nên nội dung các Part bị khoá, để bài làm cũ trong Lịch sử luôn khớp
                                với đề. Muốn đổi nội dung, hãy tạo đề mới.
                            </p>
                        )}

                        {/* `disabled` khoá mọi ô và nút chọn ảnh bên trong khi đề đã có lượt làm */}
                        <fieldset disabled={locked} className="disabled:opacity-70 min-w-0">
                            {/* Part ẩn vẫn mount để giữ ảnh xem trước và để react-hook-form kiểm tra đủ mọi Part */}
                            {templates.map((template, index) => (
                                <div
                                    key={template.id}
                                    hidden={index !== activeIndex}
                                    className="motion-safe:animate-rise"
                                >
                                    <PartSection skill={skill} template={template} index={index} />
                                </div>
                            ))}
                        </fieldset>

                        {/* Ngoài fieldset: đề bị khoá vẫn chuyển Part để xem được */}
                        <div className="flex flex-wrap justify-between gap-3">
                            {prevTemplate && (
                                <Button
                                    type="button"
                                    variant="third"
                                    size="md"
                                    className="gap-2 bg-white"
                                    onClick={() => goToPart(activeIndex - 1)}
                                >
                                    <LuArrowLeft className="size-4" aria-hidden="true" />
                                    Part {prevTemplate.part_no}
                                </Button>
                            )}
                            {nextTemplate && (
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="md"
                                    className="gap-2 ml-auto"
                                    onClick={() => goToPart(activeIndex + 1)}
                                >
                                    Tiếp: Part {nextTemplate.part_no}
                                    <LuArrowRight className="size-4" aria-hidden="true" />
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </form>
        </FormProvider>
    );
}

interface StatusChipProps {
    href: string;
    label: string;
    /** Tên đọc cho trình đọc màn hình khi `label` chỉ là con số. */
    srLabel?: string;
    status: ItemStatus;
    onClick: () => void;
}

function StatusChip({ href, label, srLabel = label, status, onClick }: StatusChipProps) {
    const { Icon, label: statusLabel, className } = ITEM_STATUS[status];
    return (
        <a
            href={href}
            onClick={(event) => {
                event.preventDefault();
                onClick();
            }}
            aria-label={`${srLabel}: ${statusLabel}`}
            title={`${srLabel}: ${statusLabel}`}
            className={cn(
                'inline-flex items-center gap-1 px-2 rounded-md h-7 font-semibold tabular-nums text-xs transition-shadow',
                'hover:ring-1 hover:ring-sub2/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3',
                className,
            )}
        >
            <Icon className="size-3.5" aria-hidden="true" />
            {label}
        </a>
    );
}
