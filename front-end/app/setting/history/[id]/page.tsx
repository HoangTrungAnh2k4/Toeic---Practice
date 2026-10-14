import { Suspense } from 'react';
import AttemptReviewSkeleton from './_components/AttemptReviewSkeleton';
import AttemptReviewView from './_components/AttemptReviewView';

interface AttemptReviewPageProps {
    params: Promise<{ id: string }>;
}

export default function AttemptReviewPage({ params }: AttemptReviewPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            {/* params là runtime data → stream trong Suspense */}
            <Suspense fallback={<AttemptReviewSkeleton />}>
                <AttemptReviewView params={params} />
            </Suspense>
        </main>
    );
}
