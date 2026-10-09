import { MdEditNote, MdMic, MdMonitor, MdTipsAndUpdates, MdTrackChanges } from 'react-icons/md';

export default function SkillGoals_Chart() {
    return (
        <div className="items-stretch gap-6 grid grid-cols-1 lg:grid-cols-12">
            {/* Left: skill targets */}
            <div className="flex flex-col gap-4 lg:col-span-7">
                <div className="flex justify-between items-center">
                    <h3 className="flex items-center gap-1 font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                        <MdTrackChanges className="text-[#0037b0] text-[22px]" />
                        <span>Mục tiêu kỹ năng chuẩn hóa</span>
                    </h3>
                    <span className="font-semibold text-[#434655] text-[0.6875rem] uppercase leading-3.5 tracking-wider">
                        Target: 330/400
                    </span>
                </div>

                {/* Speaking */}
                <div className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-6 rounded-[0.5rem] transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex justify-center items-center bg-[#e5eeff] rounded-[0.5rem] w-12 h-12 text-[#0037b0]">
                                <MdMic className="text-[26px]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                                    TOEIC Speaking
                                </h4>
                                <p className="text-[#434655] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                                    Thang điểm ETS: 0 - 200 điểm
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-[#0037b0] text-[1.375rem] leading-7 tracking-[-0.015em]">
                                130{' '}
                                <span className="font-normal text-[#434655] text-[0.875rem] leading-5.5 tracking-normal">
                                    / 160 Mục tiêu
                                </span>
                            </div>
                            <span className="font-semibold text-[#006a63] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                +15 điểm từ tháng trước
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-semibold text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            <span className="text-[#434655]">Tiến độ đạt mục tiêu</span>
                            <span className="font-bold text-[#0037b0]">65%</span>
                        </div>
                        <div className="bg-[#dbe9ff] rounded-[0.75rem] w-full h-3 overflow-hidden">
                            <div
                                className="bg-[#0037b0] rounded-[0.75rem] h-full transition-all duration-700 ease-out"
                                style={{ width: '65%' }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#eef4ff] p-2 rounded-[0.25rem]">
                        <MdTipsAndUpdates className="text-[#733100] text-[18px] shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-[#733100] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                Trọng tâm:
                            </span>
                            <span className="ml-1 text-[#0b1c2f] text-[0.75rem] truncate leading-4.5 tracking-[0.005em]">
                                Cần cải thiện Ngữ điệu & Fluency ở Q5-7 (Hội thoại tình huống).
                            </span>
                        </div>
                    </div>
                </div>

                {/* Writing */}
                <div className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-6 rounded-[0.5rem] transition-shadow">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-2">
                            <div className="flex justify-center items-center bg-[#99efe5]/40 rounded-[0.5rem] w-12 h-12 text-[#006a63]">
                                <MdEditNote className="text-[26px]" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                                    TOEIC Writing
                                </h4>
                                <p className="text-[#434655] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                                    Thang điểm ETS: 0 - 200 điểm
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-bold text-[#006a63] text-[1.375rem] leading-7 tracking-[-0.015em]">
                                140{' '}
                                <span className="font-normal text-[#434655] text-[0.875rem] leading-5.5 tracking-normal">
                                    / 170 Mục tiêu
                                </span>
                            </div>
                            <span className="font-semibold text-[#006a63] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                +20 điểm từ tháng trước
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-semibold text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            <span className="text-[#434655]">Tiến độ đạt mục tiêu</span>
                            <span className="font-bold text-[#006a63]">70%</span>
                        </div>
                        <div className="bg-[#dbe9ff] rounded-[0.75rem] w-full h-3 overflow-hidden">
                            <div
                                className="bg-[#006a63] rounded-[0.75rem] h-full transition-all duration-700 ease-out"
                                style={{ width: '70%' }}
                            />
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-[#eef4ff] p-2 rounded-[0.25rem]">
                        <MdTipsAndUpdates className="text-[#0037b0] text-[18px] shrink-0" />
                        <div className="flex-1 min-w-0">
                            <span className="font-semibold text-[#0037b0] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                                Trọng tâm:
                            </span>
                            <span className="ml-1 text-[#0b1c2f] text-[0.75rem] truncate leading-4.5 tracking-[0.005em]">
                                Cần mở rộng từ vựng liên kết ở Essay Q8 (Nghị luận quan điểm).
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: trend chart */}
            <div className="flex flex-col justify-between lg:col-span-5 bg-white shadow-sm p-6 rounded-[0.5rem]">
                <div className="flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                        <h3 className="flex items-center gap-1 font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                            <MdMonitor className="text-[#0037b0] text-[20px]" />
                            <span>Tiến độ luyện tập</span>
                        </h3>
                        <span className="bg-[#e5eeff] px-1 py-0.5 rounded-xs font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            Dữ liệu minh họa
                        </span>
                    </div>
                    <p className="text-[#434655] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                        Tần suất & mức độ độc lập khi giải đề qua 7 ngày gần nhất
                    </p>
                </div>

                <div className="flex flex-col gap-2 my-4">
                    <div className="relative flex items-center w-full h-44">
                        <svg
                            className="w-full h-full overflow-visible"
                            fill="none"
                            viewBox="0 0 320 120"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            {/* grid */}
                            <line
                                className="text-[#c4c5d7]/30"
                                stroke="currentColor"
                                strokeDasharray="3 3"
                                x1="0"
                                x2="320"
                                y1="20"
                                y2="20"
                            />
                            <line
                                className="text-[#c4c5d7]/30"
                                stroke="currentColor"
                                strokeDasharray="3 3"
                                x1="0"
                                x2="320"
                                y1="60"
                                y2="60"
                            />
                            <line
                                className="text-[#c4c5d7]/30"
                                stroke="currentColor"
                                strokeDasharray="3 3"
                                x1="0"
                                x2="320"
                                y1="100"
                                y2="100"
                            />
                            {/* Làm không trợ giúp */}
                            <path
                                className="text-[#0037b0]"
                                d="M 10 95 C 50 85, 90 70, 130 50 C 170 35, 220 45, 260 25 C 280 18, 300 20, 310 15"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeWidth="3"
                            />
                            {/* Làm lại / Có trợ giúp */}
                            <path
                                className="text-[#006a63]"
                                d="M 10 55 C 50 60, 90 50, 130 65 C 170 75, 220 70, 260 85 C 280 90, 300 95, 310 98"
                                fill="none"
                                stroke="currentColor"
                                strokeDasharray="4 4"
                                strokeLinecap="round"
                                strokeWidth="2.5"
                            />
                            {/* points */}
                            <circle
                                className="fill-white text-[#0037b0]"
                                cx="10"
                                cy="95"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                className="fill-white text-[#0037b0]"
                                cx="130"
                                cy="50"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                className="fill-white text-[#0037b0]"
                                cx="260"
                                cy="25"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                className="fill-white text-[#0037b0]"
                                cx="310"
                                cy="15"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                className="fill-white text-[#006a63]"
                                cx="130"
                                cy="65"
                                r="3.5"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                className="fill-white text-[#006a63]"
                                cx="260"
                                cy="85"
                                r="3.5"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                            <circle
                                className="fill-white text-[#006a63]"
                                cx="310"
                                cy="98"
                                r="3.5"
                                stroke="currentColor"
                                strokeWidth="2"
                            />
                        </svg>
                    </div>
                    <div className="flex justify-between px-1 font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                        <span>T2</span>
                        <span>T3</span>
                        <span>T4</span>
                        <span>T5</span>
                        <span>T6</span>
                        <span>T7</span>
                        <span className="font-bold text-[#0037b0]">CN</span>
                    </div>
                </div>

                <div className="flex flex-col gap-1 bg-[#eef4ff] p-2 rounded-[0.25rem]">
                    <div className="flex justify-between items-center font-semibold text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                        <div className="flex items-center gap-1">
                            <span className="bg-[#0037b0] rounded-[0.75rem] w-3 h-1" />
                            <span className="font-semibold text-[#0b1c2f]">Làm không trợ giúp</span>
                        </div>
                        <span className="font-bold text-[#0037b0]">72% tổng số bài</span>
                    </div>
                    <div className="flex justify-between items-center font-semibold text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                        <div className="flex items-center gap-1">
                            <span className="bg-[#006a63] border-b border-dashed rounded-[0.75rem] w-3 h-1" />
                            <span className="text-[#434655]">Làm lại / Có trợ giúp</span>
                        </div>
                        <span className="text-[#434655]">28% (Đang giảm dần)</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
