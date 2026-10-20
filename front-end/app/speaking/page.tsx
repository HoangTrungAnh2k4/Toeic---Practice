import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ExamLibraryResults } from '@/components/exam-library/exam-library-results';
import { LibraryHero } from '@/components/exam-library/library-hero';
import { LibraryKpiCards } from '@/components/exam-library/library-kpi-cards';
import { LibraryResultsSkeleton } from '@/components/exam-library/library-results-skeleton';
import { StrategyTips } from '@/components/exam-library/strategy-tips';
import { RawSearchParams } from '@/lib/exam-library/search-params';
import { getLibraryExams } from '@/lib/exam-library/summaries';
import { UserExamStatesProvider } from '@/lib/exam-library/use-user-exam-states';
import SpeakingRubricGuide from './_components/SpeakingRubricGuide';
import { PART_STRATEGIES } from './utils';

export const metadata: Metadata = {
    title: 'Đề TOEIC Speaking | Toeco',
    description: 'Kho đề TOEIC Speaking 11 câu theo format ETS, chấm điểm bằng AI ngay sau khi nộp.',
};

interface SpeakingPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default async function SpeakingPage({ searchParams }: SpeakingPageProps) {
    const exams = await getLibraryExams('speaking');

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <UserExamStatesProvider examIds={exams.map((exam) => exam.id)}>
                <LibraryHero skill="speaking" exams={exams} />
                <LibraryKpiCards skill="speaking" exams={exams} />

                {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
                <Suspense fallback={<LibraryResultsSkeleton />}>
                    <ExamLibraryResults skill="speaking" exams={exams} searchParams={searchParams} />
                </Suspense>
            </UserExamStatesProvider>

            <SpeakingRubricGuide />
            <StrategyTips skill="speaking" strategies={PART_STRATEGIES} />
        </main>
    );
}
