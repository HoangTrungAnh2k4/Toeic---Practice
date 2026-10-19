import Link from 'next/link';
import { LuArrowLeft, LuChevronRight, LuHeadset, LuShieldCheck } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { SETTING_BASE_PATH } from '@/app/setting/utils';

export default function DeviceCheckHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuHeadset className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                       
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <Link
                            href={SETTING_BASE_PATH}
                            className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring hover:text-main transition-colors"
                        >
                            Cài đặt
                        </Link>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main" aria-current="page">
                            Kiểm tra thiết bị
                        </span>
                    </nav>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">Kiểm tra thiết bị</h1>
                        <span className="inline-flex items-center gap-1 bg-sub3/20 px-2 py-0.5 rounded-full font-semibold text-main text-xs">
                            <LuShieldCheck className="size-3.5" aria-hidden="true" />
                            Xử lý ngay trên trình duyệt
                        </span>
                    </div>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Kiểm tra lần lượt <strong className="text-main">tai nghe, micro</strong> và{' '}
                        <strong className="text-main">bàn phím</strong> trước khi vào phòng thi Speaking & Writing. Đoạn
                        ghi âm thử chỉ dùng để bạn nghe lại và không được tải lên máy chủ.
                    </p>
                </div>
            </div>

            {/* Header Actions */}
            <Link
                href={SETTING_BASE_PATH}
                className={cn(
                    buttonVariants({ variant: 'third', size: 'md' }),
                    'gap-2 self-start xl:self-auto bg-white shrink-0',
                )}
            >
                <LuArrowLeft className="size-4" aria-hidden="true" />
                <span>Quay lại Cài đặt</span>
            </Link>
        </div>
    );
}
