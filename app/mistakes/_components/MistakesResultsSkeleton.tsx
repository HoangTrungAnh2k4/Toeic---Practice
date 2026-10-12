import { Skeleton } from '@/components/ui/skeleton';

const CARD_COUNT = 4;

export default function MistakesResultsSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải sổ lỗi">
            <div className="flex flex-col gap-4 bg-card shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl">
                <Skeleton className="w-full max-w-md h-9" />
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
                    <Skeleton className="sm:col-span-2 h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                </div>
                <Skeleton className="w-full max-w-lg h-6" />
            </div>

            <div className="gap-4 grid grid-cols-1 lg:grid-cols-2">
                {Array.from({ length: CARD_COUNT }, (_, i) => (
                    <Skeleton key={i} className="rounded-xl h-64" />
                ))}
            </div>
        </div>
    );
}
