import {
    MdGraphicEq,
    MdPlayArrow,
    MdPriorityHigh,
    MdRecordVoiceOver,
    MdReplay,
    MdTimer,
    MdVerified,
} from 'react-icons/md';

export default function HeroBanner() {
    return (
        <div className="relative bg-linear-to-r from-[#1d4ed8] to-[#0037b0] shadow-md p-8 rounded-[0.5rem] overflow-hidden text-white">
            <div className="top-0 right-0 bottom-0 absolute flex justify-center items-center opacity-10 w-1/3 pointer-events-none">
                <MdRecordVoiceOver className="text-[240px]" />
            </div>
            <div className="z-10 relative flex md:flex-row flex-col justify-between md:items-center gap-6">
                <div className="flex flex-col gap-2 max-w-2xl">
                    <div className="inline-flex items-center gap-1 bg-white/15 px-2 py-1 rounded-[0.75rem] w-fit text-white">
                        <MdPriorityHigh className="text-[16px]" />
                        <span className="font-semibold text-[0.6875rem] uppercase leading-3.5 tracking-wider">
                            Việc học tiếp theo • Mục tiêu hôm nay
                        </span>
                    </div>
                    <div>
                        <h2 className="font-semibold text-[1.375rem] text-white leading-7 tracking-[-0.015em]">
                            Luyện Speaking Part 3 — Respond to Questions
                        </h2>
                        <p className="mt-1 text-[#cad3ff] text-[0.875rem] leading-5.5">
                            Thời lượng dự kiến: 20 phút • 3 câu hỏi tình huống thường nhật (Thói quen mua sắm trực tuyến
                            & Dịch vụ khách hàng).
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 pt-1 font-semibold text-[#cad3ff] text-[0.75rem] leading-4 tracking-[0.04em]">
                        <span className="flex items-center gap-1">
                            <MdTimer className="text-[18px]" /> 20:00 chuẩn bị & phản xạ
                        </span>
                        <span className="flex items-center gap-1">
                            <MdVerified className="text-[18px]" /> Chấm AI phát âm & Lexical Resource
                        </span>
                        <span className="flex items-center gap-1">
                            <MdGraphicEq className="text-[18px]" /> Lưu bản ghi âm phân tích
                        </span>
                    </div>
                </div>
                <div className="flex sm:flex-row flex-col items-stretch sm:items-center gap-2 shrink-0">
                    <button
                        type="button"
                        className="flex justify-center items-center gap-1 bg-white hover:bg-[#e5eeff] shadow-md px-6 py-3 rounded-[0.25rem] font-semibold text-[#0037b0] text-[0.875rem] leading-[1.25rem] tracking-[0.01em] active:scale-[0.98] transition-all"
                    >
                        <MdPlayArrow className="text-[20px]" />
                        <span>Bắt đầu ngay</span>
                    </button>
                    <button
                        type="button"
                        className="flex justify-center items-center gap-1 bg-white/10 hover:bg-white/20 px-4 py-3 rounded-[0.25rem] font-semibold text-[0.875rem] text-white leading-[1.25rem] tracking-[0.01em] transition-all"
                    >
                        <MdReplay className="text-[20px]" />
                        <span>Tiếp tục buổi luyện dở dang</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
