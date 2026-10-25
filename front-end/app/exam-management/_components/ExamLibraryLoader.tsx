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

/** Form tạo/sửa đề chuyển về đây kèm `?created=` / `?updated=<id đề>`; đọc một lần rồi xoá khỏi URL để tải lại không báo lại. */
function takeSavedNotice(exams: ExamLibraryItem[]): string {
    const url = new URL(window.location.href);
    const created = url.searchParams.get('created');
    const id = created ?? url.searchParams.get('updated');
    if (!id) return '';
    url.searchParams.delete('created');
    url.searchParams.delete('updated');
    window.history.replaceState(null, '', url);
    const code = exams.find((exam) => exam.id === id)?.code;
    if (!code) return '';
    return created ? `Đã tạo đề ${code} ở trạng thái nháp.` : `Đã lưu thay đổi của đề ${code}.`;
}

export default function ExamLibraryLoader() {
    const [state, setState] = useState<LoadState>({ status: 'loading' });

    const load = useCallback(() => {
        getExamLibrary()
            .then((exams) => setState({ status: 'ready', exams, notice: takeSavedNotice(exams) }))
            .catch(() => setState({ status: 'error' }));
    }, []);

    useEffect(load, [load]);

    if (state.status === 'ready') return <ExamLibrary initialExams={state.exams} initialNotice={state.notice} />;

    if (state.status === 'loading') {
        return (
            <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải kho đề">

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
