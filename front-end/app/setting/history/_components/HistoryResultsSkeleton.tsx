import { Skeleton } from '@/components/ui/skeleton';

const ROW_COUNT = 5;

export default function HistoryResultsSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải lịch sử làm bài">
            <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                {Array.from({ length: 4 }, (_, i) => (
                    <Skeleton key={i} className="rounded-xl h-36" />
                ))}
            </div>

            <div className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl">
                <Skeleton className="w-full max-w-xl h-9" />
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5">
                    <Skeleton className="sm:col-span-3 xl:col-span-2 h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
                <Skeleton className="w-full max-w-md h-6" />
            </div>

            <div className="flex flex-col gap-3 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl">
                <Skeleton className="h-11" />
                {Array.from({ length: ROW_COUNT }, (_, i) => (
                    <Skeleton key={i} className="h-16" />
                ))}
            </div>
        </div>
    );
}
