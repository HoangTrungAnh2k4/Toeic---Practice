import { LuArrowRight, LuCalendarX, LuLibrary, LuRefreshCcw, LuSlidersHorizontal } from 'react-icons/lu';
import type { IconType } from 'react-icons';
import SessionDurationSwitch from './SessionDurationSwitch';

const QUICK_ACTIONS: { id: string; label: string; Icon: IconType }[] = [
    { id: 'postpone', label: 'Bận đột xuất? Dời bài hôm nay sang Thứ 7', Icon: LuCalendarX },
    { id: 'library', label: 'Bổ sung đề tự chọn từ thư viện ETS', Icon: LuLibrary },
];

interface FlexibilityPanelProps {
    minutesPerDay: number;
}

export default function FlexibilityPanel({ minutesPerDay }: FlexibilityPanelProps) {
    return (
        <section
            aria-labelledby="flexibility-title"
            className="flex flex-col gap-4 bg-white shadow-sm p-5 border border-sub2/30 rounded-xl h-full"
        >
            <div className="flex items-start gap-3">
                <span className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                    <LuSlidersHorizontal className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-0.5">
                    <h2 id="flexibility-title" className="font-bold text-main text-lg">
                        Cân bằng & Linh hoạt
                    </h2>
                    <p className="font-medium text-subText text-xs leading-relaxed">
                        Điều chỉnh cường độ theo lịch bận thực tế mà không làm đứt đà tăng điểm.
                    </p>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                {QUICK_ACTIONS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        type="button"
                        className="group flex justify-between items-center gap-3 bg-white hover:bg-sub1/50 p-3 border border-sub2/30 hover:border-sub2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring text-left transition-colors cursor-pointer"
                    >
                        <span className="flex items-center gap-2.5 font-semibold text-main text-sm">
                            <Icon className="size-4 text-sub2 shrink-0" aria-hidden="true" />
                            {label}
                        </span>
                        <LuArrowRight
                            className="size-4 text-sub2 group-hover:text-main transition-transform group-hover:translate-x-0.5 shrink-0"
                            aria-hidden="true"
                        />
                    </button>
                ))}
                <SessionDurationSwitch defaultValue={minutesPerDay} />
            </div>

            <div className="flex items-start gap-3 bg-sub3/10 mt-auto p-3 border border-sub3/50 rounded-lg">
                <LuRefreshCcw className="mt-0.5 size-4 text-main shrink-0" aria-hidden="true" />
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-main text-xs">Cơ chế tự cân bằng</span>
                    <p className="text-[11px] text-subText leading-relaxed">
                        Hoàn thành sớm hoặc lỡ một buổi? Hệ thống tự phân bổ lại khối lượng cho các ngày tiếp theo mà
                        không làm quá tải tuần thi.
                    </p>
                </div>
            </div>
        </section>
    );
}
