import { Skeleton } from '@/components/ui/skeleton';
import { PAGE_SIZE } from '@/lib/exam-library/options';

export function LibraryResultsSkeleton() {
    return (
        <div className="flex flex-col gap-4" aria-busy="true" aria-label="Đang tải thư viện đề">
            {/* Filters */}
            <div className="flex flex-col gap-4 bg-white shadow-sm p-4 sm:p-5 border border-sub2/30 rounded-xl">
                <div className="flex flex-wrap justify-between items-center gap-3 pb-4 border-sub2/20 border-b">
                    <Skeleton className="bg-sub1 rounded-lg w-full max-w-xl h-9" />
                    <Skeleton className="bg-sub1 rounded-lg w-40 h-7" />
                </div>
                <div className="gap-3 grid grid-cols-1 sm:grid-cols-3 xl:grid-cols-5">
                    <Skeleton className="sm:col-span-3 xl:col-span-2 bg-sub1 rounded-lg h-10" />
                    {Array.from({ length: 3 }, (_, i) => (
                        <Skeleton key={i} className="bg-sub1 rounded-lg h-10" />
                    ))}
                </div>
            </div>

            {/* Test cards */}
            <div className="gap-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: PAGE_SIZE }, (_, i) => (
                    <div
                        key={i}
                        className="flex flex-col gap-3 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl"
                    >
                        <div className="flex justify-between">
                            <Skeleton className="bg-sub1 w-24 h-5" />
                            <Skeleton className="bg-sub1 w-16 h-5" />
                        </div>
                        <Skeleton className="bg-sub1 w-4/5 h-5" />
                        <Skeleton className="bg-sub1 w-full h-12" />
                        <Skeleton className="bg-sub1 mt-2 w-full h-9" />
                    </div>
                ))}
            </div>
        </div>
    );
}
