import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { FaPenFancy } from 'react-icons/fa';
import { MdMic, MdTipsAndUpdates } from 'react-icons/md';

export default function SkillGoals() {
    return (
        <div className="flex flex-col flex-1 gap-4 lg:col-span-7">
            {/* Writing */}
            <div className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-6 border border-sub1/50 rounded-xl transition-shadow">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center items-center bg-sub1 rounded-[0.5rem] size-10 text-sub2">
                            <FaPenFancy size={20} className="text-main" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#333] text-xl leading-6 tracking-[-0.01em]">
                                TOEIC Writing
                            </h4>
                            <p className="font-medium text-[#5c596a] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                                Thang điểm ETS: 0 - 200 điểm
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-[1.375rem] text-sub2 leading-7 tracking-[-0.015em]">
                            140{' '}
                            <span className="font-medium text-[0.875rem] text-main leading-5.5 tracking-normal">
                                / 170 Mục tiêu
                            </span>
                        </div>
                        <span className="font-semibold text-[0.6875rem] text-main leading-3.5 tracking-wider">
                            +20 điểm từ tháng trước
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between font-semibold text-xs leading-3.5 tracking-wider">
                        <span className="text-main">Tiến độ đạt mục tiêu</span>
                        <span className="font-bold text-main">70%</span>
                    </div>
                    <div className="bg-sub1 rounded-[0.75rem] w-full h-3 overflow-hidden">
                        <div
                            className="bg-sub2 rounded-[0.75rem] h-full transition-all duration-700 ease-out"
                            style={{ width: '70%' }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-sub1/50 p-2 rounded-lg">
                    <MdTipsAndUpdates className="text-[18px] text-main shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="font-semibold text-main text-xs leading-3.5 tracking-wider">Trọng tâm:</span>
                        <span className="ml-1 font-medium text-main text-xs truncate leading-4.5 tracking-[0.005em]">
                            Cần mở rộng từ vựng liên kết ở Essay Q8 (Nghị luận quan điểm).
                        </span>
                    </div>
                </div>
            </div>

            {/* Speaking */}
            <div className="flex flex-col gap-4 bg-white shadow-sm hover:shadow-md p-6 border border-sub1/50 rounded-xl transition-shadow">
                <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex justify-center items-center bg-sub3/10 rounded-[0.5rem] size-10 text-sub2">
                            <MdMic size={24} className="text-sub3" />
                        </div>
                        <div>
                            <h4 className="font-semibold text-[#333] text-xl leading-6 tracking-[-0.01em]">
                                TOEIC Speaking
                            </h4>
                            <p className="font-medium text-[#5c596a] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                                Thang điểm ETS: 0 - 200 điểm
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-[1.375rem] text-sub3 leading-7 tracking-[-0.015em]">
                            140{' '}
                            <span className="font-medium text-[0.875rem] text-main leading-5.5 tracking-normal">
                                / 170 Mục tiêu
                            </span>
                        </div>
                        <span className="font-semibold text-[0.6875rem] text-main leading-3.5 tracking-wider">
                            +20 điểm từ tháng trước
                        </span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <div className="flex justify-between font-semibold text-xs leading-3.5 tracking-wider">
                        <span className="text-main">Tiến độ đạt mục tiêu</span>
                        <span className="font-bold text-main">70%</span>
                    </div>
                    <div className="bg-sub1 rounded-[0.75rem] w-full h-3 overflow-hidden">
                        <div
                            className="bg-sub3 rounded-[0.75rem] h-full transition-all duration-700 ease-out"
                            style={{ width: '70%' }}
                        />
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-sub3/10 p-2 rounded-lg">
                    <MdTipsAndUpdates className="text-[18px] text-sub3 shrink-0" />
                    <div className="flex-1 min-w-0">
                        <span className="font-semibold text-main text-xs leading-3.5">Trọng tâm:</span>
                        <span className="ml-1 font-medium text-main text-xs truncate leading-4.5 tracking-[0.005em]">
                            Cần mở rộng từ vựng liên kết ở Essay Q8 (Nghị luận quan điểm).
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
