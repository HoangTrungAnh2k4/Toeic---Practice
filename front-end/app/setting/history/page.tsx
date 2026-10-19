import { Suspense } from 'react';
import { GuestDataNotice } from '@/components/user/guest-data-notice';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import HistoryResults from './_components/HistoryResults';
import HistoryResultsSkeleton from './_components/HistoryResultsSkeleton';
import { RawSearchParams } from './_lib/searchParams';

interface HistoryPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
    // Mọi đề, kể cả đã gỡ phát hành, để lượt làm cũ vẫn hiện tên đề
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
