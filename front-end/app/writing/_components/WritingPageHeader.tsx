import { LuChevronRight, LuPenLine } from 'react-icons/lu';

export default function WritingPageHeader() {
    return (
        <div className="flex xl:flex-row flex-col justify-between xl:items-end gap-4">
            {/* Title & Breadcrumb */}
            <div className="flex items-start gap-3">
                <span className="hidden sm:flex justify-center items-center bg-main shadow-sm rounded-xl size-12 text-sub3 shrink-0">
                    <LuPenLine className="size-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1.5">
                    <nav
                        aria-label="Breadcrumb"
                        className="flex flex-wrap items-center gap-1.5 font-semibold text-sub2 text-xs uppercase tracking-wider"
                    >
                       
                        <LuChevronRight className="size-3.5" aria-hidden="true" />
                        <span className="text-main">Phòng thi Writing (CBT)</span>
                    </nav>
                    <h1 className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                        Luyện Writing — Thư viện đề & Phòng thi chuẩn ETS
                    </h1>
                    <p className="max-w-3xl font-medium text-subText text-sm leading-relaxed">
                        Luyện tập theo quy chuẩn 8 câu thi viết trên máy tính (60 phút). AI phân tích ngữ pháp thời gian
                        thực, kiểm soát từ khóa bắt buộc và chấm rubric chi tiết: Grammar, Relevance, Cohesion, Task
                        Completion.
                    </p>
                </div>
            </div>

            {/* Engine status */}
            <div
                role="status"
                className="flex items-center self-start xl:self-auto gap-2 bg-white shadow-sm px-3 py-1.5 border border-sub2/30 rounded-full shrink-0"
            >
                <span className="bg-sub3 rounded-full size-2 animate-pulse" aria-hidden="true" />
                <span className="font-semibold text-main text-xs">ETS Writing Engine v3.2 đang hoạt động</span>
            </div>
        </div>
    );
}
