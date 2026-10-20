'use client';

import { useState } from 'react';
import { LuCheck } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { completePlanTask } from '@/lib/data/user-data';
import { cn } from '@/lib/utils';

interface CompleteTaskButtonProps {
    taskId: string;
    onCompleted: () => void;
    className?: string;
}

/** Task không cần bài làm (ôn lỗi, tổng kết) tự đánh dấu xong. */
export default function CompleteTaskButton({ taskId, onCompleted, className }: CompleteTaskButtonProps) {
    const [saving, setSaving] = useState(false);
    const [failed, setFailed] = useState(false);

    const complete = async () => {
        setSaving(true);
        setFailed(false);
        try {
            await completePlanTask(taskId);
            onCompleted();
        } catch {
            setFailed(true);
        } finally {
            setSaving(false);
        }
    };

    return (
        <span className={cn('inline-flex flex-col items-end gap-1', className)}>
            <Button
                type="button"
                variant="third"
                size="sm"
                className="gap-1.5 bg-white text-xs"
                disabled={saving}
                onClick={complete}
            >
                <LuCheck className="size-3.5" aria-hidden="true" />
                {saving ? 'Đang lưu…' : 'Đánh dấu xong'}
            </Button>
            {failed && (
                <span role="alert" className="font-medium text-destructive text-xs">
                    Chưa lưu được, thử lại.
                </span>
            )}
        </span>
    );
}
