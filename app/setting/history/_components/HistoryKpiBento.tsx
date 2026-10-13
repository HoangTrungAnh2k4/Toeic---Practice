import { LuBadgeCheck, LuChartBar, LuHistory, LuHourglass } from 'react-icons/lu';

const CARD_CLASS =
    'flex flex-col justify-between gap-4 bg-white p-5 border border-sub2/30 rounded-xl shadow-sm transition-shadow hover:shadow-md';

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

export default function HistoryKpiBento() {
    return (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {/* Metric 1: Total Attempts — highlighted card */}
            <div className="flex flex-col justify-between gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">
                            Tổng số lượt làm bài
                        </span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-white text-3xl tracking-tight">28</span>
                            <span className="font-semibold text-sub3 text-xs">+4 tuần này</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                        <LuHistory className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-lg text-sub1 text-xs">
                    <span>
                        Speaking: <strong className="font-semibold text-white">16</strong>
                    </span>
                    <span className="bg-sub2/50 w-px h-3" aria-hidden="true" />
                    <span>
                        Writing: <strong className="font-semibold text-white">12</strong>
                    </span>
                </div>
            </div>

            {/* Metric 2: Average Score Estimator */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Điểm ước tính TB</span>
                        <div className="flex flex-wrap items-baseline gap-x-4">
                            <span className="font-bold text-main text-xl whitespace-nowrap">
                                S: 135<span className="font-normal text-sub2 text-xs">/200</span>
                            </span>
                            <span className="font-bold text-main text-xl whitespace-nowrap">
                                W: 145<span className="font-normal text-sub2 text-xs">/200</span>
                            </span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                        <LuChartBar className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-subText text-xs">
                    <span className="bg-sub3 rounded-full size-2" aria-hidden="true" />
                    <span>ETS Range: Level 6 - Phù hợp mục tiêu 300+</span>
                </div>
            </div>

            {/* Metric 3: Independent Practice Ratio */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Làm bài độc lập</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">72%</span>
                            <span className="font-semibold text-sub2 text-xs">20/28 lượt</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                        <LuBadgeCheck className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div
                    role="progressbar"
                    aria-label="Tỉ lệ làm bài không trợ giúp"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={72}
                    className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
                >
                    <div
                        className="bg-linear-to-r from-sub2 to-main rounded-full h-full transition-all duration-500"
                        style={{ width: '72%' }}
                    />
                </div>
            </div>

            {/* Metric 4: Pending Processing & Local Sync */}
            <div className="flex flex-col justify-between gap-4 bg-sub3/10 shadow-sm p-5 border border-sub3/50 rounded-xl">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Chờ chấm / Chờ đồng bộ</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">2</span>
                            <span className="font-semibold text-main/70 text-xs">Cần xử lý</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                        <LuHourglass className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex justify-between items-center bg-white px-3 py-2 border border-sub3/40 rounded-lg font-medium text-main text-xs">
                    <span className="flex items-center gap-1.5">
                        <span className="bg-sub3 rounded-full size-1.5 animate-pulse" aria-hidden="true" />1 Local
                        cache
                    </span>
                    <span className="bg-sub3/50 w-px h-3" aria-hidden="true" />
                    <span>1 AI đang chấm</span>
                </div>
            </div>
        </div>
    );
}
