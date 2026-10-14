import { Suspense } from 'react';
import WritingHeroCard from './_components/WritingHeroCard';
import WritingKpiCards from './_components/WritingKpiCards';
import WritingPageHeader from './_components/WritingPageHeader';
import WritingResults from './_components/WritingResults';
import WritingResultsSkeleton from './_components/WritingResultsSkeleton';
import WritingRubricGuide from './_components/WritingRubricGuide';
import WritingStrategyTips from './_components/WritingStrategyTips';
import { RawSearchParams } from './_lib/searchParams';

interface WritingPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default function WritingPage({ searchParams }: WritingPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <WritingPageHeader />
            <WritingHeroCard />
            <WritingKpiCards />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<WritingResultsSkeleton />}>
                <WritingResults searchParams={searchParams} />
            </Suspense>

            <WritingStrategyTips />
            <WritingRubricGuide />
        </main>
    );
}
