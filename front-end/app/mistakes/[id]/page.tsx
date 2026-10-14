import { Suspense } from 'react';
import MistakeDetailSkeleton from './_components/MistakeDetailSkeleton';
import MistakeDetailView from './_components/MistakeDetailView';

interface MistakeDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function MistakeDetailPage({ params }: MistakeDetailPageProps) {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            {/* params là runtime data → stream trong Suspense */}
            <Suspense fallback={<MistakeDetailSkeleton />}>
                <MistakeDetailView params={params} />
            </Suspense>
        </main>
    );
}
