import { Suspense } from 'react';
import { getMistakeIndex } from '@/app/mistakes/_lib/data';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import AttemptReviewSkeleton from './_components/AttemptReviewSkeleton';
import AttemptReviewView from './_components/AttemptReviewView';

interface AttemptReviewPageProps {
    params: Promise<{ id: string }>;
}

export default async function AttemptReviewPage({ params }: AttemptReviewPageProps) {
    const [exams, mistakeIndex] = await Promise.all([getExamSummaries(), getMistakeIndex()]);

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            {/* params là runtime data → stream trong Suspense */}
            <Suspense fallback={<AttemptReviewSkeleton />}>
                <AttemptReviewView params={params} exams={exams} mistakeIndex={mistakeIndex} />
            </Suspense>
        </main>
    );
}
