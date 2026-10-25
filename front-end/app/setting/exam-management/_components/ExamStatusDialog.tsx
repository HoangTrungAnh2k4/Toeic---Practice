'use client';

import { useId, useState } from 'react';
import { LuCircleAlert, LuLoaderCircle } from 'react-icons/lu';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogMedia,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import Button from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import type { ExamStatus } from '@/lib/domain/types';
import { changeExamStatus } from '../_lib/data';
import { MAX_NOTE_LENGTH, needsNote } from '../_lib/examStatus';
import { STATUS_ACTION } from '../_lib/examStyle';
import { ExamLibraryItem } from '../types';
import { formatCount } from '../utils';

interface ExamStatusDialogProps {
    open: boolean;
    exam: ExamLibraryItem | null;
    target: ExamStatus | null;
    onOpenChange: (open: boolean) => void;
    onChanged: (exam: ExamLibraryItem, status: ExamStatus, note: string | null) => void;
}

function describe(exam: ExamLibraryItem, target: ExamStatus) {
    if (target === 'review') return 'Đề chuyển sang Chờ thẩm định. Người học chưa thấy đề cho tới khi phát hành.';
    if (target === 'published') {
        return 'Hệ thống kiểm tra đề đủ dữ liệu rồi mở đề trong Thư viện cho mọi người học.';
    }
    if (target === 'archived') {
        const attempts = formatCount(exam.stats?.attempt_count ?? 0);
        return `Đề bị gỡ khỏi Thư viện, không ai bắt đầu lượt mới được. ${attempts} lượt làm vẫn giữ trong Lịch sử của người học, lượt đang làm dở vẫn làm nốt được.`;
    }
    return 'Đề quay về Bản nháp để sửa. Ghi rõ lý do để người sửa biết cần sửa gì.';
}

/** Xác nhận chuyển trạng thái; giữ dialog mở khi lỗi để hiện danh sách câu còn thiếu. */
export default function ExamStatusDialog({ open, exam, target, onOpenChange, onChanged }: ExamStatusDialogProps) {
    const noteId = useId();
    const [note, setNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<{ message: string; issues: string[] } | null>(null);

    if (!exam || !target) return null;
    const action = STATUS_ACTION[target];
    const requiresNote = needsNote(target);

    const submit = async () => {
        if (requiresNote && !note.trim()) return setError({ message: 'Vui lòng ghi lý do trả về nháp.', issues: [] });
        setSubmitting(true);
        setError(null);
        const result = await changeExamStatus(exam.id, target, requiresNote ? note.trim() : undefined);
        setSubmitting(false);
        if (!result.ok) return setError(result);
        onChanged(exam, target, requiresNote ? note.trim() : null);
    };

    return (
        <AlertDialog open={open} onOpenChange={(next) => !submitting && onOpenChange(next)}>
            <AlertDialogContent className="gap-5 data-[size=default]:sm:max-w-md">
                <AlertDialogHeader>
                    <AlertDialogMedia className="bg-sub1 text-main">
                        <action.Icon aria-hidden="true" />
                    </AlertDialogMedia>
                    <AlertDialogTitle className="font-bold text-main text-lg">{action.label}?</AlertDialogTitle>
                    <AlertDialogDescription className="text-subText">{describe(exam, target)}</AlertDialogDescription>
                </AlertDialogHeader>

                <p className="bg-sub1/60 px-4 py-3 rounded-lg text-subText text-xs">
                    <strong className="font-semibold text-main">{exam.title}</strong>
                    <br />
                    <span className="font-mono">{exam.code}</span> · {formatCount(exam.stats?.attempt_count ?? 0)} lượt thi
                </p>

                {requiresNote && (
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor={noteId} className="font-semibold text-main text-sm">
                            Lý do trả về <span className="text-destructive">*</span>
                        </label>
                        <Textarea
                            id={noteId}
                            rows={3}
                            maxLength={MAX_NOTE_LENGTH}
                            value={note}
                            onChange={(event) => setNote(event.target.value)}
                            placeholder="Ví dụ: Câu 3 thiếu mô tả ảnh, email câu 6 sai tên người nhận."
                            aria-invalid={Boolean(error) && !note.trim()}
                        />
                    </div>
                )}

                {error && (
                    <div role="alert" className="flex flex-col gap-1 bg-destructive/10 px-4 py-3 rounded-lg text-destructive text-sm">
                        <p className="flex items-start gap-2 font-medium">
                            <LuCircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                            {error.message}
                        </p>
                        {error.issues.length > 0 && (
                            <ul className="pl-6 max-h-40 overflow-y-auto list-disc text-xs">
                                {error.issues.map((issue) => (
                                    <li key={issue}>{issue}</li>
                                ))}
                            </ul>
                        )}
                    </div>
                )}

                <AlertDialogFooter className="bg-sub1/40 border-sub2/20">
                    <AlertDialogCancel variant="third" size="md" className="bg-white" disabled={submitting}>
                        Hủy
                    </AlertDialogCancel>
                    <Button type="button" variant="primary" size="md" className="gap-2" disabled={submitting} onClick={submit}>
                        {submitting && <LuLoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
                        {action.label}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
