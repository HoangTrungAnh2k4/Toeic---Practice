import { Suspense } from 'react';
import { ExamLibraryResults } from '@/components/exam-library/exam-library-results';
import { LibraryHero } from '@/components/exam-library/library-hero';
import { LibraryKpiCards } from '@/components/exam-library/library-kpi-cards';
import { LibraryResultsSkeleton } from '@/components/exam-library/library-results-skeleton';
import { StrategyTips } from '@/components/exam-library/strategy-tips';
import { RawSearchParams } from '@/lib/exam-library/search-params';
import { getLibraryExams } from '@/lib/exam-library/summaries';
import WritingPageHeader from './_components/WritingPageHeader';
import WritingRubricGuide from './_components/WritingRubricGuide';
import { PART_STRATEGIES } from './utils';

interface WritingPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default async function WritingPage({ searchParams }: WritingPageProps) {
    const exams = await getLibraryExams('writing');

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <WritingPageHeader />
            <LibraryHero skill="writing" exams={exams} />
            <LibraryKpiCards skill="writing" exams={exams} />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<LibraryResultsSkeleton />}>
                <ExamLibraryResults skill="writing" exams={exams} searchParams={searchParams} />
            </Suspense>

            <WritingRubricGuide />
            <StrategyTips skill="writing" strategies={PART_STRATEGIES} />
        </main>
    );
}
