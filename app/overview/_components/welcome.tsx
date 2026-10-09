import { MdSchool } from 'react-icons/md';

export default function WelcomeBanner() {
    return (
        <div className="relative bg-white shadow-sm p-8 rounded-[0.5rem] overflow-hidden">
            <div className="-top-12 -right-12 absolute bg-gradient-to-br from-[#0037b0]/10 via-[#e5eeff] to-transparent blur-3xl rounded-[0.75rem] w-96 h-96 pointer-events-none" />
            <div className="z-10 relative flex lg:flex-row flex-col justify-between lg:items-center gap-6">
                <div className="flex flex-col gap-1 max-w-2xl">
                    <div className="flex items-center gap-1 font-semibold text-[#0037b0] text-[0.6875rem] uppercase leading-3.5 tracking-widest">
                        <MdSchool className="text-[18px]" />
                        <span>TOEIC Speaking & Writing Acceleration</span>
                    </div>
                    <h1 className="font-semibold text-[#0b1c2f] text-[2rem] leading-[2.5rem] tracking-tight">
                        Chào Minh Anh, sẵn sàng cho buổi luyện hôm nay!
                    </h1>
                    <p className="text-[#434655] text-[1rem] leading-[1.625rem]">
                        Bạn đã hoàn thành 4 chuỗi luyện liên tiếp. Hãy duy trì nhịp độ phản xạ nói và tư duy mạch lạc
                        cho cấu trúc bài viết Email & Essay.
                    </p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                    <div className="flex flex-col gap-1 bg-[#eef4ff] shadow-sm p-4 rounded-[0.5rem] min-w-[130px]">
                        <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            Chuỗi ngày học
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold text-[#0037b0] text-[1.375rem] leading-7 tracking-[-0.015em]">
                                12
                            </span>
                            <span className="font-semibold text-[#434655] text-[0.75rem] leading-4 tracking-[0.04em]">
                                ngày
                            </span>
                        </div>
                        <span className="font-semibold text-[#006a63] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            Kỷ lục: 15 ngày
                        </span>
                    </div>
                    <div className="flex flex-col gap-1 bg-[#eef4ff] shadow-sm p-4 rounded-[0.5rem] min-w-[130px]">
                        <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            Thời gian tích lũy
                        </span>
                        <div className="flex items-baseline gap-1">
                            <span className="font-bold text-[#0b1c2f] text-[1.375rem] leading-7 tracking-[-0.015em]">
                                28.5
                            </span>
                            <span className="font-semibold text-[#434655] text-[0.75rem] leading-4 tracking-[0.04em]">
                                giờ
                            </span>
                        </div>
                        <span className="font-semibold text-[#0037b0] text-[0.6875rem] leading-3.5 tracking-[0.05em]">
                            +3.2h tuần này
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
