import type { Metadata } from 'next';
import { Suspense } from 'react';
import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import AttemptReviewSkeleton from './_components/AttemptReviewSkeleton';
import AttemptReviewView from './_components/AttemptReviewView';

export const metadata: Metadata = {
    title: 'Xem lại bài làm | Toeco',
};

interface AttemptReviewPageProps {
    params: Promise<{ id: string }>;
}

export default async function AttemptReviewPage({ params }: AttemptReviewPageProps) {
    const [exams, patterns] = await Promise.all([getExamSummaries(), listMistakePatterns()]);

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            {/* params là runtime data → stream trong Suspense */}
            <Suspense fallback={<AttemptReviewSkeleton />}>
                <AttemptReviewView params={params} exams={exams} patterns={patterns} />
            </Suspense>
        </main>
    );
}
