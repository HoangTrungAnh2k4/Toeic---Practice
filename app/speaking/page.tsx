import { Suspense } from 'react';
import SpeakingHeroCard from './_components/SpeakingHeroCard';
import SpeakingKpiCards from './_components/SpeakingKpiCards';
import SpeakingResults from './_components/SpeakingResults';
import SpeakingResultsSkeleton from './_components/SpeakingResultsSkeleton';
import SpeakingRubricGuide from './_components/SpeakingRubricGuide';
import SpeakingStrategyTips from './_components/SpeakingStrategyTips';
import { RawSearchParams } from './_lib/searchParams';

interface SpeakingPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default function SpeakingPage({ searchParams }: SpeakingPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <SpeakingHeroCard />
            <SpeakingKpiCards />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<SpeakingResultsSkeleton />}>
                <SpeakingResults searchParams={searchParams} />
            </Suspense>

            <SpeakingRubricGuide />
            <SpeakingStrategyTips />
        </main>
    );
}
