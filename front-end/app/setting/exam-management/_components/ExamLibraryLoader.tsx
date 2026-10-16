'use client';

import { useCallback, useEffect, useState } from 'react';
import { LuRotateCw, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { getExamLibrary } from '../_lib/data';
import { ExamLibraryItem } from '../types';
import ExamLibrary from './ExamLibrary';

type LoadState =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'ready'; exams: ExamLibraryItem[]; notice: string };

/** Form tạo đề chuyển về đây kèm `?created=<mã đề>`; đọc một lần rồi xoá khỏi URL để tải lại không báo lại. */
function takeCreatedNotice(): string {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('created');
    if (!code) return '';
    url.searchParams.delete('created');
    window.history.replaceState(null, '', url);
    return `Đã tạo đề ${code} ở trạng thái nháp.`;
}

export default function ExamLibraryLoader() {
    const [state, setState] = useState<LoadState>({ status: 'loading' });

    const load = useCallback(() => {
        getExamLibrary()
            .then((exams) => setState({ status: 'ready', exams, notice: takeCreatedNotice() }))
            .catch(() => setState({ status: 'error' }));
    }, []);

    useEffect(load, [load]);

    if (state.status === 'ready') return <ExamLibrary initialExams={state.exams} initialNotice={state.notice} />;

    if (state.status === 'loading') {
        return (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải kho đề">
                <Skeleton className="w-64 h-8" />
                <Skeleton className="rounded-xl w-full h-14" />
                <Skeleton className="rounded-xl w-full h-96" />
            </div>
        );
    }

    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 bg-card shadow-sm px-4 py-12 border border-sub2/30 rounded-xl text-center"
        >
            <LuTriangleAlert className="size-6 text-sub2" aria-hidden="true" />
            <p className="font-semibold text-main text-sm">Không tải được kho đề thi.</p>
            <Button
                type="button"
                variant="primary"
                size="sm"
                className="gap-2 text-xs"
                onClick={() => {
                    setState({ status: 'loading' });
                    load();
                }}
            >
                <LuRotateCw className="size-4" aria-hidden="true" />
                Thử lại
            </Button>
        </div>
    );
}
