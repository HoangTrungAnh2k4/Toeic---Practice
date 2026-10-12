import { Skeleton } from '@/components/ui/skeleton';

export default function StudioSkeleton() {
    return (
        <div aria-busy="true" aria-label="Đang tải Studio biên tập" className="gap-4 grid grid-cols-1 lg:grid-cols-12">
            <div className="flex flex-col gap-4 lg:col-span-4 bg-white shadow-sm p-4 border border-sub2/30 rounded-xl">
                <Skeleton className="bg-sub1 rounded-lg h-36" />
                {Array.from({ length: 5 }, (_, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <Skeleton className="bg-sub1 rounded-md size-8 shrink-0" />
                        <div className="flex flex-col flex-1 gap-1.5">
                            <Skeleton className="bg-sub1 w-3/4 h-3.5" />
                            <Skeleton className="bg-sub1 w-1/2 h-3" />
                        </div>
                    </div>
                ))}
                <Skeleton className="bg-sub1 rounded-lg h-24" />
            </div>
            <div className="flex flex-col gap-4 lg:col-span-8 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl">
                <Skeleton className="bg-sub1 w-2/3 h-6" />
                <Skeleton className="bg-sub1 w-1/2 h-4" />
                <Skeleton className="bg-sub1 rounded-lg h-20" />
                {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="bg-sub1 rounded-xl h-40" />
                ))}
            </div>
        </div>
    );
}
