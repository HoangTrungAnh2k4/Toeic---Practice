'use client';

import { MdArrowForward, MdBolt, MdChecklist, MdError, MdPlayCircle, MdWarning } from 'react-icons/md';

export default function PriorityError() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="flex items-center gap-1 font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                        <MdError className="text-[#ba1a1a] text-[22px]" />
                        <span>2 Lỗi ưu tiên cần khắc phục ngay</span>
                    </h3>
                    <p className="text-[#434655] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                        Được trích xuất từ 5 bài nộp gần nhất theo thang chấm chuẩn hóa ETS
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {}}
                    className="flex items-center gap-1 font-semibold text-[#0037b0] text-[0.75rem] hover:underline leading-4 tracking-[0.04em]"
                >
                    <span>Xem sổ lỗi hoàn chỉnh (14)</span>
                    <MdArrowForward className="text-[16px]" />
                </button>
            </div>

            <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                {/* Error 1 — Speaking */}
                <div className="flex flex-col justify-between gap-4 bg-white shadow-sm hover:shadow-md p-6 rounded-[0.5rem] transition-shadow">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                                <span className="bg-[#0037b0]/10 px-1 py-0.5 rounded-xs font-semibold text-[#0037b0] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                    Speaking Q3-4
                                </span>
                                <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                    • Describe a picture
                                </span>
                            </div>
                            <span className="bg-[#ffdad6] px-1 py-0.5 rounded-xs font-semibold text-[#93000a] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                Tần suất: 3/4 bài
                            </span>
                        </div>
                        <h4 className="font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                            Thiếu giới từ chỉ vị trí khi mô tả background
                        </h4>
                        <p className="text-[#434655] text-[0.875rem] leading-5.5">
                            Có xu hướng chuyển cảnh vội vàng mà bỏ qua các cụm từ định vị không gian cốt lõi như in the
                            backgroun, adjacent to, hoặc on the upper left corner.
                        </p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1 font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            <MdBolt className="text-[#733100] text-[16px]" />
                            <span>Mất điểm tiêu chí Lexical Resource</span>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-1 bg-[#0037b0] hover:bg-[#1d4ed8] shadow-sm px-4 py-2 rounded-[0.25rem] font-semibold text-[0.75rem] text-white leading-4 tracking-[0.04em] transition-colors"
                        >
                            <MdPlayCircle className="text-[18px]" />
                            <span>Luyện 3 câu dạng này</span>
                        </button>
                    </div>
                </div>

                {/* Error 2 — Writing */}
                <div className="flex flex-col justify-between gap-4 bg-white shadow-sm hover:shadow-md p-6 rounded-[0.5rem] transition-shadow">
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-1">
                                <span className="bg-[#006a63]/15 px-1 py-0.5 rounded-xs font-semibold text-[#006a63] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                    Writing Q6-7
                                </span>
                                <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                    • Respond to an email
                                </span>
                            </div>
                            <span className="bg-[#ffdad6] px-1 py-0.5 rounded-xs font-semibold text-[#93000a] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                Tần suất: 2/3 bài
                            </span>
                        </div>
                        <h4 className="font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                            Quên giải quyết yêu cầu thứ hai trong Email prompt
                        </h4>
                        <p className="text-[#434655] text-[0.875rem] leading-5.5">
                            Tập trung trả lời sâu cho câu hỏi xác nhận thông tin đầu tiên dẫn tới việc thiếu phần đưa ra
                            02 đề xuất giải pháp (suggestions) ở đoạn kết nối theo hướng dẫn của đề bài.
                        </p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <div className="flex items-center gap-1 font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            <MdWarning className="text-[#733100] text-[16px]" />
                            <span>Hạ trần điểm Task Completion từ 4 xuống 2</span>
                        </div>
                        <button
                            type="button"
                            className="flex items-center gap-1 bg-[#006a63] hover:bg-[#006a63]/90 shadow-sm px-4 py-2 rounded-[0.25rem] font-semibold text-[0.75rem] text-white leading-4 tracking-[0.04em] transition-colors"
                        >
                            <MdChecklist className="text-[18px]" />
                            <span>Luyện checklist trả lời email</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
