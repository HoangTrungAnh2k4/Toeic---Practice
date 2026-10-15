import { LuCalendarClock, LuCalendarDays, LuChevronRight, LuSparkles } from 'react-icons/lu';
import Button, { buttonVariants } from '@/components/ui/button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface SchedulePageHeaderProps {
    /** `study_plans.ai_rationale`; `null` dùng mô tả chung. */
    rationale: string | null;
    /** Khách không có lộ trình nên ẩn các nút chỉnh lộ trình. */
    showActions: boolean;
}

export default function SchedulePageHeader({ rationale, showActions }: SchedulePageHeaderProps) {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuCalendarDays className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                        <span>TOEIC Speaking & Writing</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main">Kế hoạch học thích ứng</span>
                    </nav>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                        Kế hoạch học & Lộ trình bứt phá điểm số
                    </h1>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        {rationale ?? 'Lộ trình cá nhân hóa theo ngày thi, mục tiêu điểm và các lỗi bạn hay gặp.'}
                    </p>
                </div>
            </div>

            {/* Header Actions */}
            {showActions && (
            <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto shrink-0">
                <Link
                    href="/setting/profile"
                    className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'gap-2 bg-white')}
                >
                    <LuCalendarClock className="size-4" aria-hidden="true" />
                    <span>Mục tiêu & Lịch thi</span>
                </Link>
                <Button type="button" size="md" variant="primary" className="gap-2">
                    <LuSparkles className="size-4" aria-hidden="true" />
                    <span>Tối ưu lộ trình (AI)</span>
                </Button>
            </div>
            )}
        </div>
    );
}
