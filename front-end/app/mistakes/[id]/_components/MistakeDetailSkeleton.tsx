import { Skeleton } from '@/components/ui/skeleton';

export default function MistakeDetailSkeleton() {
    return (
        <div className="flex flex-col gap-6" aria-busy="true" aria-label="Đang tải chi tiết lỗi">
            <div className="flex flex-col gap-3">
                <Skeleton className="w-24 h-6" />
                <Skeleton className="w-48 h-5" />
                <Skeleton className="w-full max-w-2xl h-9" />
                <Skeleton className="w-full max-w-3xl h-10" />
            </div>

            <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-3">
                <div className="flex flex-col gap-6 lg:col-span-2">
                    <Skeleton className="rounded-xl h-56" />
                    <Skeleton className="rounded-xl h-96" />
                </div>
                <div className="flex flex-col gap-6">
                    <Skeleton className="rounded-xl h-72" />
                    <Skeleton className="rounded-xl h-44" />
                </div>
            </div>
        </div>
    );
}
