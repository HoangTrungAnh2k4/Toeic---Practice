import { Suspense } from 'react';
import HistoryKpiBento from './_components/HistoryKpiBento';
import HistoryPageHeader from './_components/HistoryPageHeader';
import HistoryResults from './_components/HistoryResults';
import HistoryResultsSkeleton from './_components/HistoryResultsSkeleton';
import HistoryStorageBanner from './_components/HistoryStorageBanner';
import { RawSearchParams } from './_lib/searchParams';

interface HistoryPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default function HistoryPage({ searchParams }: HistoryPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <HistoryPageHeader />
            <HistoryKpiBento />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<HistoryResultsSkeleton />}>
                <HistoryResults searchParams={searchParams} />
            </Suspense>

            <HistoryStorageBanner />
        </main>
    );
}
