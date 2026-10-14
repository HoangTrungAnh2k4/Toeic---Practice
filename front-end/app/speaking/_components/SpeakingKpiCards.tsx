import Link from 'next/link';
import { LuArrowRight, LuBadgeCheck, LuBrain, LuChartBar, LuLibrary } from 'react-icons/lu';
import { cn } from '@/lib/utils';

const CARD_CLASS =
    'flex flex-col justify-between gap-4 bg-white p-5 border border-sub2/30 rounded-xl shadow-sm transition-shadow hover:shadow-md';

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

const ICON_BOX_CLASS = 'flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0';

const COMPLETION_PERCENT = 33.3;

const FOCUS_POINTS = [
    {
        part: 'Ngữ điệu Part 3 (Q5-7)',
        note: 'Hạ giọng sớm ở câu hỏi Yes/No, cần nâng ngữ điệu cuối câu.',
        dotClass: 'bg-destructive',
    },
    {
        part: 'Ngập ngừng Part 5 (Q11)',
        note: 'Trung bình 1.4s trước khi vào ý, chuẩn ETS dưới 0.8s.',
        dotClass: 'bg-sub3',
    },
];

export default function SpeakingKpiCards() {
    return (
        <div className="gap-4 grid grid-cols-1 md:grid-cols-3">
            {/* Library progress */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Thư viện đề Speaking</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">24</span>
                            <span className="font-semibold text-sub2 text-xs">bộ đề chuẩn ETS</span>
                        </div>
                    </div>
                    <div className={ICON_BOX_CLASS}>
                        <LuLibrary className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex flex-col gap-1.5">
                    <div
                        role="progressbar"
                        aria-label="Tiến độ hoàn thành thư viện đề"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={COMPLETION_PERCENT}
                        className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
                    >
                        <div
                            className="bg-linear-to-r from-sub2 to-main rounded-full h-full transition-all duration-500"
                            style={{ width: `${COMPLETION_PERCENT}%` }}
                        />
                    </div>
                    <div className="flex justify-between items-center font-medium text-subText text-xs">
                        <span>
                            Đã hoàn thành <strong className="font-semibold text-main">8 đề</strong>
                        </span>
                        <span className="font-semibold text-main">{COMPLETION_PERCENT}%</span>
                    </div>
                </div>
            </div>

            {/* Predicted score */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Điểm Speaking dự đoán</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">140</span>
                            <span className="font-semibold text-sub2 text-xs">/200 · Level 6</span>
                        </div>
                        <p className="font-medium text-subText text-xs">
                            Cách mục tiêu 160 (Level 7): <strong className="font-semibold text-main">+20 điểm</strong>
                        </p>
                    </div>
                    <div className={ICON_BOX_CLASS}>
                        <LuChartBar className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex flex-wrap justify-between items-center gap-2 bg-sub1/60 px-3 py-2 rounded-lg font-medium text-main text-xs">
                    <span className="flex items-center gap-1.5">
                        <LuBadgeCheck className="size-4 text-sub2" aria-hidden="true" />
                        Độ tin cậy: 88%
                    </span>
                    <span className="font-semibold">Cần thêm 3 đề thi thử</span>
                </div>
            </div>

            {/* AI focus areas */}
            <div className="flex flex-col justify-between gap-4 bg-sub3/10 shadow-sm p-5 border border-sub3/50 rounded-xl">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-3">
                        <span className={LABEL_CLASS}>Trọng tâm cần cải thiện (AI)</span>
                        <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                            <LuBrain className="size-5" aria-hidden="true" />
                        </div>
                    </div>
                    <ul className="flex flex-col gap-2">
                        {FOCUS_POINTS.map(({ part, note, dotClass }) => (
                            <li key={part} className="flex items-start gap-2 text-xs leading-relaxed">
                                <span className={cn('mt-1.5 rounded-full size-1.5 shrink-0', dotClass)} aria-hidden="true" />
                                <span>
                                    <strong className="font-semibold text-main">{part}:</strong>{' '}
                                    <span className="text-subText">{note}</span>
                                </span>
                            </li>
                        ))}
                    </ul>
                </div>
                <Link
                    href="/setting/history?skill=speaking"
                    className="inline-flex items-center gap-1 self-end px-1 rounded-md font-semibold text-main text-xs hover:underline underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3"
                >
                    Xem lại lỗi trong lịch sử Speaking
                    <LuArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            </div>
        </div>
    );
}
