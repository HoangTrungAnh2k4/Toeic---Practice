import { Suspense } from 'react';
import { GuestDataNotice } from '@/components/user/guest-data-notice';
import HistoryKpiBento from './_components/HistoryKpiBento';
import HistoryPageHeader from './_components/HistoryPageHeader';
import HistoryResults from './_components/HistoryResults';
import HistoryResultsSkeleton from './_components/HistoryResultsSkeleton';
import { RawSearchParams } from './_lib/searchParams';

interface HistoryPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default function HistoryPage({ searchParams }: HistoryPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <HistoryPageHeader />
            <GuestDataNotice />
            <HistoryKpiBento />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<HistoryResultsSkeleton />}>
                <HistoryResults searchParams={searchParams} />
            </Suspense>
        </main>
    );
}
