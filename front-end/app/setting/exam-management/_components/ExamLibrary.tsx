'use client';

import { useMemo, useState } from 'react';
import { LuDownload, LuPlus } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import { deleteExam } from '../_lib/data';
import { downloadJson } from '../_lib/downloadJson';
import { ExamLibraryItem } from '../types';
import {
    DEFAULT_EXAM_FILTERS,
    EXAM_LIBRARY_ID,
    ExamFilters,
    filterExams,
    getTabCounts,
} from '../utils';
import DeleteExamDialog from './DeleteExamDialog';
import ExamLibraryFilters from './ExamLibraryFilters';
import ExamLibraryTable from './ExamLibraryTable';
import Link from 'next/dist/client/link';
import { cn } from 'cn';

interface ExamLibraryProps {
    initialExams: ExamLibraryItem[];
    initialNotice?: string;
}

export default function ExamLibrary({ initialExams, initialNotice = '' }: ExamLibraryProps) {
    const [exams, setExams] = useState(initialExams);
    const [filters, setFilters] = useState<ExamFilters>(DEFAULT_EXAM_FILTERS);
    // Giữ đề đang chọn khi đóng dialog để nội dung không biến mất trong lúc chạy animation
    const [deleteTarget, setDeleteTarget] = useState<ExamLibraryItem | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [notice, setNotice] = useState(initialNotice);

    const tabCounts = useMemo(() => getTabCounts(exams), [exams]);
    const filteredExams = useMemo(() => filterExams(exams, filters), [exams, filters]);
    const canReset =
        filters.tab !== DEFAULT_EXAM_FILTERS.tab ||
        filters.search !== DEFAULT_EXAM_FILTERS.search ||
        filters.status !== DEFAULT_EXAM_FILTERS.status ||
        filters.source !== DEFAULT_EXAM_FILTERS.source;

    const handleFilterChange = (patch: Partial<ExamFilters>) => setFilters((prev) => ({ ...prev, ...patch }));

    const handleResetFilters = () => setFilters(DEFAULT_EXAM_FILTERS);

    const handleRequestDelete = (exam: ExamLibraryItem) => {
        setDeleteTarget(exam);
        setIsDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!deleteTarget) return;
        const { id, code } = deleteTarget;
        setIsDeleteOpen(false);
        setNotice(`Đang xóa đề ${code}…`);
        const error = await deleteExam(id).catch(() => 'Không xóa được đề. Vui lòng thử lại.');
        if (error) return setNotice(error);
        setExams((prev) => prev.filter((exam) => exam.id !== id));
        setNotice(`Đã xóa đề ${code} khỏi kho.`);
    };

    const handleExport = () => {
        downloadJson('kho-de-thi-toeic-sw.json', filteredExams);
        setNotice(`Đã xuất ${filteredExams.length} đề thi ra file JSON.`);
    };

    return (
        <section id={EXAM_LIBRARY_ID} aria-labelledby="exam-library-title" className="flex flex-col gap-4 scroll-mt-4">
            {/* Section header */}
            <div className="flex sm:flex-row flex-col justify-between sm:items-end gap-3">
                <div className="flex flex-col gap-0.5">
                    <h2 id="exam-library-title" className="font-bold text-main text-lg">
                        Kho đề thi trong hệ thống
                    </h2>
                    <p className="font-medium text-subText text-xs">
                        Quản lý, kiểm duyệt và phân phối bộ đề Speaking & Writing cho luyện tập và thi thử.
                    </p>
                </div>
                <div className='flex gap-3'>
                    <Link
                        href="/setting/exam-management/new"
                        className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2 self-start xl:self-auto shrink-0')}
                    >
                        Tạo đề Speaking
                    </Link>
                    <div className="flex items-center self-start sm:self-auto gap-3">
                        <span role="status" aria-live="polite" className="font-semibold text-main text-xs">
                            {notice}
                        </span>
                        <Button
                            type="button"
                            variant="third"
                            size="sm"
                            onClick={handleExport}
                            disabled={filteredExams.length === 0}
                            className="gap-1.5 bg-white text-xs shrink-0"
                        >
                            <LuDownload className="size-3.5" aria-hidden="true" />
                            Xuất JSON
                        </Button>
                    </div>
                </div>
            </div>

            <ExamLibraryFilters
                filters={filters}
                tabCounts={tabCounts}
                resultCount={filteredExams.length}
                canReset={canReset}
                onChange={handleFilterChange}
                onReset={handleResetFilters}
            />

            <ExamLibraryTable
                exams={filteredExams}
                totalCount={exams.length}
                onDelete={handleRequestDelete}
                onResetFilters={handleResetFilters}
            />

            <DeleteExamDialog
                open={isDeleteOpen}
                exam={deleteTarget}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleConfirmDelete}
            />
        </section>
    );
}
