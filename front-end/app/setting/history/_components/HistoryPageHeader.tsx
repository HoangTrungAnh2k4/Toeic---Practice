import Link from 'next/link';
import { LuChevronRight, LuDownload, LuHistory } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { SETTING_BASE_PATH } from '@/app/setting/utils';

export default function HistoryPageHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuHistory className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                        <span>TOEIC Speaking & Writing</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <Link
                            href={SETTING_BASE_PATH}
                            className="hover:text-main rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
                        >
                            Cài đặt
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main" aria-current="page">
                            Nhật ký nỗ lực
                        </span>
                    </nav>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                        Lịch sử làm bài & Nhật ký nỗ lực
                    </h1>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Theo dõi toàn bộ các lượt làm bài Speaking, Writing và Thi thử hoàn chỉnh. Phân biệt rõ lượt làm
                        độc lập, làm lại và các bài đang chờ chấm theo chuẩn khảo thí ETS.
                    </p>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto shrink-0">
                <Button type="button" size="md" variant="third" className="gap-2 bg-white">
                    <LuDownload className="size-4" aria-hidden="true" />
                    <span>Báo cáo (PDF)</span>
                </Button>
            </div>
        </div>
    );
}
