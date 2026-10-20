'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { LuCircleAlert, LuSave } from 'react-icons/lu';
import FormField from '@/app/setting/exam-management/new/_components/FormField';
import Button from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toDayKey } from '@/lib/data/user-stats';
import type { Profile, StudyPlan } from '@/lib/domain/types';
import {
    getPlanGoalsDefaults,
    type PlanContext,
    planGoalsSchema,
    type PlanGoalsValues,
    savePlan,
} from '../_lib/planForm';
import { SESSION_DURATION_OPTIONS } from '../utils';

const NO_TARGET = 'none';
const TARGET_ITEMS = [
    { value: NO_TARGET, label: 'Không luyện' },
    ...Array.from({ length: 20 }, (_, index) => {
        const score = 200 - index * 10;
        return { value: String(score), label: `${score} điểm` };
    }),
];
const DAY_ITEMS = [3, 4, 5, 6, 7].map((days) => ({ value: String(days), label: `${days} buổi/tuần` }));
const MINUTE_ITEMS = SESSION_DURATION_OPTIONS.map((minutes) => ({ value: String(minutes), label: `${minutes} phút` }));

interface PlanGoalDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: Profile;
    plan: StudyPlan | null;
    context: PlanContext;
    onSaved: () => void;
}

const tomorrow = () => {
    const date = new Date();
    return toDayKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1));
};

/** Đặt mục tiêu + ngày thi; lưu là sinh lộ trình mới (thay lộ trình đang có). */
export default function PlanGoalDialog({ open, onOpenChange, profile, plan, context, onSaved }: PlanGoalDialogProps) {
    const form = useForm<PlanGoalsValues>({
        resolver: zodResolver(planGoalsSchema),
        defaultValues: getPlanGoalsDefaults(profile, plan),
    });
    const { control, formState, reset } = form;

    // Mở lại thì lấy giá trị mới nhất của hồ sơ/lộ trình
    useEffect(() => {
        if (open) reset(getPlanGoalsDefaults(profile, plan));
    }, [open, profile, plan, reset]);

    const onSubmit = form.handleSubmit(async (values) => {
        try {
            await savePlan(values, context);
            onOpenChange(false);
            onSaved();
        } catch {
            form.setError('root', { message: 'Không tạo được lộ trình. Vui lòng thử lại.' });
        }
    });

    const targetSelect = (name: 'target_speaking' | 'target_writing', label: string) => (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormField label={label} error={fieldState.error?.message}>
                    {(controlProps) => (
                        <Select
                            items={TARGET_ITEMS}
                            value={field.value === null ? NO_TARGET : String(field.value)}
                            onValueChange={(value) => field.onChange(value === NO_TARGET ? null : Number(value))}
                        >
                            <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {TARGET_ITEMS.map((item) => (
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
    );

    const numberSelect = (
        name: 'days_per_week' | 'minutes_per_day',
        label: string,
        items: { value: string; label: string }[],
    ) => (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <FormField label={label} error={fieldState.error?.message}>
                    {(controlProps) => (
                        <Select
                            items={items}
                            value={String(field.value)}
                            onValueChange={(value) => field.onChange(Number(value))}
                        >
                            <SelectTrigger {...controlProps} ref={field.ref} onBlur={field.onBlur} className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {items.map((item) => (
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
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-5 sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="font-bold text-main text-lg tracking-tight">
                        Mục tiêu & Lịch thi
                    </DialogTitle>
                    <DialogDescription className="font-medium text-subText text-sm">
                        Lộ trình được xếp theo điểm mục tiêu, ngày thi và các lỗi bạn hay gặp.
                    </DialogDescription>
                </DialogHeader>

                <form id="plan-goal-form" noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
                    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                        {targetSelect('target_speaking', 'Mục tiêu Speaking')}
                        {targetSelect('target_writing', 'Mục tiêu Writing')}
                    </div>
                    <Controller
                        name="exam_date"
                        control={control}
                        render={({ field, fieldState }) => (
                            <FormField label="Ngày thi" required error={fieldState.error?.message}>
                                {(controlProps) => <Input {...controlProps} {...field} type="date" min={tomorrow()} />}
                            </FormField>
                        )}
                    />
                    <div className="gap-4 grid grid-cols-1 sm:grid-cols-2">
                        {numberSelect('days_per_week', 'Số buổi học', DAY_ITEMS)}
                        {numberSelect('minutes_per_day', 'Thời lượng mỗi buổi', MINUTE_ITEMS)}
                    </div>

                    {plan && (
                        <p className="bg-sub1/60 px-4 py-3 rounded-lg font-medium text-subText text-xs leading-relaxed">
                            Lưu sẽ tạo lại lộ trình. Bài đã làm vẫn giữ trong lịch sử.
                        </p>
                    )}
                    {formState.errors.root && (
                        <p role="alert" className="flex items-center gap-2 font-medium text-destructive text-sm">
                            <LuCircleAlert className="size-4 shrink-0" aria-hidden="true" />
                            {formState.errors.root.message}
                        </p>
                    )}
                </form>

                <DialogFooter className="bg-sub1/40 border-sub2/20">
                    <Button
                        type="button"
                        variant="third"
                        size="md"
                        className="bg-white"
                        onClick={() => onOpenChange(false)}
                    >
                        Huỷ
                    </Button>
                    <Button
                        type="submit"
                        form="plan-goal-form"
                        variant="primary"
                        size="md"
                        className="gap-2"
                        disabled={formState.isSubmitting}
                    >
                        <LuSave className="size-4" aria-hidden="true" />
                        {formState.isSubmitting
                            ? 'Đang tạo lộ trình…'
                            : plan
                              ? 'Lưu & tạo lại lộ trình'
                              : 'Lưu & tạo lộ trình'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
