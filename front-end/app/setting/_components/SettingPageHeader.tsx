import { LuChevronRight, LuSettings } from 'react-icons/lu';

export default function SettingPageHeader() {
    return (
        <div className="flex items-start gap-3">
            <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                <LuSettings className="size-6" aria-hidden="true" />
            </span>
            <div className="flex flex-col gap-1.5">
                <nav
                    aria-label="Breadcrumb"
                    className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                >
                   
                    <LuChevronRight className="size-3.5" aria-hidden="true" />
                    <span className="text-main" aria-current="page">
                        Cài đặt
                    </span>
                </nav>
                <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">Cài đặt & Quản trị</h1>
                <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                    Nơi tập trung các công cụ hỗ trợ luyện thi TOEIC Speaking & Writing: chuẩn bị thiết bị trước giờ
                    thi, quản lý kho đề và các tùy chỉnh hệ thống. Chọn một mục bên dưới để bắt đầu.
                </p>
            </div>
        </div>
    );
}
