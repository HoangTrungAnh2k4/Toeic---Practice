import { Suspense } from 'react';
import MistakesHowItWorks from './_components/MistakesHowItWorks';
import MistakesPageHeader from './_components/MistakesPageHeader';
import MistakesResults from './_components/MistakesResults';
import MistakesResultsSkeleton from './_components/MistakesResultsSkeleton';
import MistakesSummary from './_components/MistakesSummary';
import { RawSearchParams } from './_lib/searchParams';

interface MistakesPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default function MistakesPage({ searchParams }: MistakesPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <MistakesPageHeader />
            <MistakesSummary />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<MistakesResultsSkeleton />}>
                <MistakesResults searchParams={searchParams} />
            </Suspense>

            <MistakesHowItWorks />
        </main>
    );
}
