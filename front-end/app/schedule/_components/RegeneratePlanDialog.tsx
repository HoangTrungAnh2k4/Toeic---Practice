'use client';

import { useState } from 'react';
import { LuCircleAlert, LuRefreshCw } from 'react-icons/lu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Profile, StudyPlan } from '@/lib/domain/types';
import { getPlanGoalsDefaults, type PlanContext, planGoalsSchema, savePlan } from '../_lib/planForm';

interface RegeneratePlanDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    profile: Profile;
    plan: StudyPlan;
    context: PlanContext;
    onSaved: () => void;
}

/** Tạo lại lộ trình từ mục tiêu + cấu hình buổi học hiện tại (khi bị lỡ nhịp). */
export default function RegeneratePlanDialog({
    open,
    onOpenChange,
    profile,
    plan,
    context,
    onSaved,
}: RegeneratePlanDialogProps) {
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const changeOpen = (next: boolean) => {
        if (saving) return;
        setError(null);
        onOpenChange(next);
    };

    const confirm = async () => {
        const values = planGoalsSchema.safeParse(getPlanGoalsDefaults(profile, plan));
        if (!values.success) {
            setError('Ngày thi đã qua hoặc chưa đặt mục tiêu. Hãy cập nhật “Mục tiêu & Lịch thi”.');
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await savePlan(values.data, context);
            onOpenChange(false);
            onSaved();
        } catch {
            setError('Không tạo lại được lộ trình. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <AlertDialog open={open} onOpenChange={changeOpen}>
            <AlertDialogContent className="gap-5 data-[size=default]:sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-sub1 text-main">
                        <LuRefreshCw aria-hidden="true" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-bold text-main text-lg">Tạo lại lộ trình?</AlertDialogTitle>
                    <AlertDialogDescription className="text-subText">
                        Lịch mới bắt đầu từ hôm nay, xếp theo điểm và sổ lỗi hiện tại. Lộ trình cũ được lưu trữ, bài đã
                        làm vẫn giữ trong lịch sử.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {error && (
                    <p role="alert" className="flex items-center gap-2 font-medium text-destructive text-sm">
                        <LuCircleAlert className="size-4 shrink-0" aria-hidden="true" />
                        {error}
                    </p>
                )}

                <AlertDialogFooter className="bg-sub1/40 border-sub2/20">
                    <AlertDialogCancel variant="third" size="md" className="bg-white" disabled={saving}>
                        Giữ lộ trình
                    </AlertDialogCancel>
                    <AlertDialogAction variant="primary" size="md" onClick={confirm} disabled={saving}>
                        {saving ? 'Đang tạo lại…' : 'Tạo lại'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
