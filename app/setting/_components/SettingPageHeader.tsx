import { LuBadgeCheck, LuChevronRight, LuLibrary, LuSettings, LuZap } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { EXAM_LIBRARY_ID, IMPORT_STUDIO_ID } from '../utils';

export default function SettingPageHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuSettings className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                        <span>TOEIC Speaking & Writing</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span>Hệ thống quản trị</span>
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main" aria-current="page">
                            Quản trị đề thi
                        </span>
                    </nav>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                        <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                            Quản trị & Soạn thảo đề thi
                        </h1>
                        <span className="inline-flex items-center gap-1 bg-sub3/20 px-2 py-0.5 rounded-full font-semibold text-main text-xs">
                            <LuBadgeCheck className="size-3.5" aria-hidden="true" />
                            Chuẩn IIG / ETS 2024
                        </span>
                    </div>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Quản lý kho đề Speaking & Writing. AI tự động bóc tách đề từ{' '}
                        <strong className="text-main">liên kết Study4</strong>, chuẩn hóa cấu trúc phòng thi và cho
                        phép <strong className="text-main">biên tập trực tiếp từng Part</strong> trước khi phát hành.
                    </p>
                </div>
            </div>

            {/* Header Actions */}
            <div className="flex flex-wrap items-center gap-3 self-start xl:self-auto shrink-0">
                <a
                    href={`#${EXAM_LIBRARY_ID}`}
                    className={cn(buttonVariants({ variant: 'third', size: 'md' }), 'gap-2 bg-white')}
                >
                    <LuLibrary className="size-4" aria-hidden="true" />
                    <span>Kho đề thi</span>
                </a>
                <a href={`#${IMPORT_STUDIO_ID}`} className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'gap-2')}>
                    <LuZap className="size-4" aria-hidden="true" />
                    <span>Tạo đề mới từ Study4</span>
                </a>
            </div>
        </div>
    );
}
