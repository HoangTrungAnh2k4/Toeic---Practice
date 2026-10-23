'use client';

import Link from 'next/link';
import { useCallback } from 'react';
import { LuFileX } from 'react-icons/lu';
import { LoadError } from '@/components/load-error';
import { buttonVariants } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAsync } from '@/hooks/use-async';
import { getExam, listExamStats } from '@/lib/data/content';
import { getExamRoom } from '@/lib/exam-library/room';
import { cn } from '@/lib/utils';
import { examToFormValues } from '../../../_lib/examSchema';
import ExamBuilderForm from '../../../new/_components/ExamBuilderForm';

/**
 * Đọc đề phía client bằng phiên admin: RLS chỉ cho admin đọc đề `draft`/`review`.
 * Không có đề trả `false` vì `null` là trạng thái "đang tải" của `useAsync`.
 */
async function loadExam(id: string) {
    const exam = await getExam(id);
    if (!exam) return false;
    const [room, stats] = await Promise.all([getExamRoom(exam.skill, id), listExamStats()]);
    if (!room) return false;
    const attempts = stats.find((row) => row.exam_id === id)?.attempt_count ?? 0;
    return { exam, values: examToFormValues(room), locked: attempts > 0 };
}

export default function ExamEditLoader({ id }: { id: string }) {
    const { data, failed, retry } = useAsync(useCallback(() => loadExam(id), [id]));

    if (failed) return <LoadError message="Không tải được đề thi." onRetry={retry} />;
    if (data === null) {
        return (
            <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải đề thi">
                <Skeleton className="w-80 h-10" />
                <Skeleton className="rounded-xl w-full h-64" />
                <Skeleton className="rounded-xl w-full h-96" />
            </div>
        );
    }

    if (!data) {
        return (
            <section className="flex flex-col items-center gap-3 bg-card shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center">
                <LuFileX className="size-6 text-sub2" aria-hidden="true" />
                <h1 className="font-semibold text-main text-base">Không tìm thấy đề thi</h1>
                <p className="text-subText text-sm">Đề có thể đã bị xoá hoặc đường dẫn không đúng.</p>
                <Link href="/setting/exam-management" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }))}>
                    Về kho đề
                </Link>
            </section>
        );
    }

    const skillLabel = data.exam.skill === 'speaking' ? 'Speaking' : 'Writing';
    return (
        <>
            <div className="flex flex-col gap-1.5">
                <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                    Sửa đề {skillLabel} <span className="font-mono text-sub2 text-xl">{data.exam.code}</span>
                </h1>
                <p className="font-medium text-subText text-sm">
                    Lưu thay đổi không đổi trạng thái của đề. Ảnh bị thay sẽ được xoá khỏi kho ảnh sau khi lưu.
                </p>
            </div>
            <ExamBuilderForm skill={data.exam.skill} exam={{ id, values: data.values, locked: data.locked }} />
        </>
    );
}
