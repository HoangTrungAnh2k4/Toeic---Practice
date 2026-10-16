'use client';

import { LoadError } from '@/components/load-error';
import type { MistakePattern } from '@/lib/domain/types';
import type { ExamSummary } from '@/lib/exam-library/types';
import { getMistakeDetail } from '../../_lib/data';
import { useMistakeBook } from '../../_lib/useMistakeBook';
import MistakeNotFound from '../not-found';
import MistakeDetailHeader from './MistakeDetailHeader';
import MistakeDetailSkeleton from './MistakeDetailSkeleton';
import MistakeEvidenceList from './MistakeEvidenceList';
import MistakePracticeCard from './MistakePracticeCard';
import MistakeProgress from './MistakeProgress';
import MistakeRelated from './MistakeRelated';
import MistakeRemedy from './MistakeRemedy';
import MistakeWhy from './MistakeWhy';

interface MistakeDetailViewProps {
    id: string;
    patterns: MistakePattern[];
    exams: ExamSummary[];
}

/** Tiến độ và bằng chứng tính từ bài làm trong localStorage → render sau khi mount. */
export default function MistakeDetailView({ id, patterns, exams }: MistakeDetailViewProps) {
    const { data: book, failed, retry } = useMistakeBook(patterns, exams);
    if (failed) return <LoadError message="Không tải được chi tiết lỗi." onRetry={retry} />;
    if (!book) return <MistakeDetailSkeleton />;

    // Server đã chặn id không tồn tại; nhánh này chỉ phòng dữ liệu đổi giữa chừng
    const mistake = getMistakeDetail(book, id);
    if (!mistake) return <MistakeNotFound />;

    return (
        <>
            <MistakeDetailHeader mistake={mistake} />

            <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2 min-w-0">
                    <MistakeWhy mistake={mistake} />
                    <MistakeRemedy remedy={mistake.remedy} />
                    <MistakeEvidenceList mistake={mistake} />
                </div>

                <aside aria-label="Tiến độ và luyện tập" className="flex flex-col gap-6 lg:top-4 lg:sticky">
                    <MistakeProgress mistake={mistake} />
                    <MistakePracticeCard mistake={mistake} />
                    <MistakeRelated items={mistake.related} />
                </aside>
            </div>
        </>
    );
}
