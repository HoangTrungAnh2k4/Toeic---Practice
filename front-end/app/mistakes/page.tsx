import type { Metadata } from 'next';
import { Suspense } from 'react';
import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import MistakesHowItWorks from './_components/MistakesHowItWorks';
import MistakesPageHeader from './_components/MistakesPageHeader';
import MistakesResults from './_components/MistakesResults';
import MistakesResultsSkeleton from './_components/MistakesResultsSkeleton';
import { RawSearchParams } from './_lib/searchParams';

export const metadata: Metadata = {
    title: 'Sổ lỗi | Toeco',
    description: 'Các lỗi lặp lại trong bài làm và cách khắc phục.',
};

interface MistakesPageProps {
    searchParams: Promise<RawSearchParams>;
}

export default async function MistakesPage({ searchParams }: MistakesPageProps) {
    const [patterns, exams] = await Promise.all([listMistakePatterns(), getExamSummaries()]);

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <MistakesPageHeader />

            {/* Phụ thuộc searchParams → stream riêng, phần tĩnh xung quanh vẫn được prerender */}
            <Suspense fallback={<MistakesResultsSkeleton />}>
                <MistakesResults patterns={patterns} exams={exams} searchParams={searchParams} />
            </Suspense>

            <MistakesHowItWorks />
        </main>
    );
}
