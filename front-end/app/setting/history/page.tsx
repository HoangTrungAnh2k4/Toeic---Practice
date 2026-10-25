import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GuestDataNotice } from '@/components/user/guest-data-notice';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import HistoryResults from './_components/HistoryResults';
import HistoryResultsSkeleton from './_components/HistoryResultsSkeleton';
import { RawSearchParams } from './_lib/searchParams';

export const metadata: Metadata = {
    title: 'Lịch sử làm bài | Toeco',
};

interface HistoryPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
    // Đề published và archived (RLS): lượt làm của đề nháp tạm ẩn (đề có lượt làm không trả về nháp được nữa,
    // chỉ còn dữ liệu cũ). Đề có lượt làm bị khoá nội dung (RPC update_exam) nên lượt cũ luôn khớp đề.
    const exams = await getExamSummaries();

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <GuestDataNotice />
            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<HistoryResultsSkeleton />}>
                <HistoryResults exams={exams} searchParams={searchParams} />
            </Suspense>
        </main>
    );
}
