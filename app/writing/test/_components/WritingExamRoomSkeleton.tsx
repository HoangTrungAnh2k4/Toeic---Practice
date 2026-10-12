import { Skeleton } from '@/components/ui/skeleton';

export default function WritingExamRoomSkeleton() {
    return (
        <div
            className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360"
            aria-busy="true"
            aria-label="Đang chuẩn bị phòng thi Writing"
        >
            <div className="shadow-sm border border-sub2/30 rounded-xl overflow-hidden">
                <div className="bg-main px-6 py-4">
                    <Skeleton className="bg-white/10 w-72 h-9" />
                </div>
                <div className="flex justify-between bg-white px-6 py-4">
                    <Skeleton className="bg-sub1 w-96 max-w-1/2 h-7" />
                    <Skeleton className="bg-sub1 w-32 h-10" />
                </div>
            </div>
            <Skeleton className="bg-white border border-sub2/30 rounded-xl h-17" />
            <div className="gap-6 grid grid-cols-1 lg:grid-cols-12">
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <Skeleton className="bg-white border border-sub2/30 rounded-xl h-24" />
                    <Skeleton className="bg-white border border-sub2/30 rounded-xl aspect-4/3" />
                </div>
                <div className="flex flex-col gap-4 lg:col-span-6">
                    <Skeleton className="bg-white border border-sub2/30 rounded-xl h-96" />
                    <Skeleton className="bg-white border border-sub2/30 rounded-xl h-20" />
                </div>
            </div>
        </div>
    );
}
