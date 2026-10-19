import Link from 'next/link';
import { LuBadgeCheck, LuChevronRight, LuFileCog, LuPlus } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function ExamManagementHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuFileCog className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                       
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <Link
                            href="/setting"
                            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-main transition-colors"
                        >
                            Cài đặt
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main" aria-current="page">
                            Quản trị đề thi
                        </span>
                    </nav>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                            Quản trị đề thi
                        </h1>
                        <span className="inline-flex items-center gap-1 bg-sub3/20 px-2 py-0.5 rounded-full font-semibold text-main text-xs">
                            <LuBadgeCheck className="size-3.5" aria-hidden="true" />
                            Chuẩn IIG / ETS 2024
                        </span>
                    </div>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Quản lý kho đề Speaking & Writing: lọc theo kỹ năng, trạng thái thẩm định và xem trước
                        phòng thi trước khi phát hành.
                    </p>
                </div>
            </div>

            <Link
                href="/setting/exam-management/new"
                className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2 self-start xl:self-auto shrink-0')}
            >
                <LuPlus className="size-4" aria-hidden="true" />
                Tạo đề Speaking
            </Link>
        </div>
    );
}
