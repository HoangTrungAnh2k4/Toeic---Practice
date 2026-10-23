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
    // Chỉ đề published (RLS): lượt làm của đề bị trả về nháp tạm ẩn, phát hành lại thì hiện lại.
    // Đề đã có lượt làm bị khoá nội dung (RPC update_exam) nên lượt cũ vẫn khớp đề khi hiện lại.
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
