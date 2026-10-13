import { Skeleton } from '@/components/ui/skeleton';

export default function AttemptReviewSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải bài làm">
            <div className="flex flex-col gap-3">
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-40 h-5" />
                <Skeleton className="w-full max-w-2xl h-9" />
                <Skeleton className="w-full max-w-xl h-6" />
            </div>
            <div className="gap-4 grid grid-cols-1 lg:grid-cols-3">
                <Skeleton className="rounded-xl h-40" />
                <Skeleton className="rounded-xl h-40" />
                <Skeleton className="rounded-xl h-40" />
            </div>
            <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-4">
                <Skeleton className="rounded-xl h-48" />
                <div className="flex flex-col gap-6 lg:col-span-3">
                    <Skeleton className="rounded-xl h-96" />
                    <Skeleton className="rounded-xl h-96" />
                </div>
            </div>
        </div>
    );
}
