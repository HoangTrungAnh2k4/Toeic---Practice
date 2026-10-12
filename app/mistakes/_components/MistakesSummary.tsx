import { LuCircleCheck, LuHourglass, LuNotebookPen, LuTarget } from 'react-icons/lu';
import { getMistakeSummary } from '../_lib/data';
import { CRITERION_LABEL } from '../utils';

const CARD_CLASS = 'flex flex-col justify-between gap-4 bg-card p-5 border border-sub2/30 rounded-xl shadow-sm';

const LABEL_CLASS = 'font-semibold text-subText text-xs uppercase tracking-wider';

export default async function MistakesSummary() {
    const summary = await getMistakeSummary();
    const { active, improving, resolved } = summary.byStatus;
    const open = active + improving;
    const resolvedRate = summary.total ? Math.round((resolved / summary.total) * 100) : 0;

    return (
        <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
            {/* Open mistakes — highlighted */}
            <div className="flex flex-col justify-between gap-4 bg-main shadow-main/20 shadow-md p-5 rounded-xl">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className="font-semibold text-sub2 text-xs uppercase tracking-wider">Lỗi cần khắc phục</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-sub1 text-3xl tracking-tight">{open}</span>
                            <span className="font-semibold text-sub3 text-xs">/ {summary.total} mẫu lỗi</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                        <LuNotebookPen className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex justify-between items-center bg-sub1/10 px-3 py-2 rounded-lg text-sub1 text-xs">
                    <span>
                        Đang lặp lại: <strong className="font-semibold text-sub3">{active}</strong>
                    </span>
                    <span className="bg-sub2/50 w-px h-3" aria-hidden="true" />
                    <span>
                        Đang cải thiện: <strong className="font-semibold text-sub1">{improving}</strong>
                    </span>
                </div>
            </div>

            {/* Resolved */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Đã khắc phục</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">{resolved}</span>
                            <span className="font-semibold text-sub2 text-xs">{resolvedRate}% sổ lỗi</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                        <LuCircleCheck className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div
                    role="progressbar"
                    aria-label="Tỉ lệ lỗi đã khắc phục"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={resolvedRate}
                    className="bg-sub1 rounded-full w-full h-2 overflow-hidden"
                >
                    <div
                        className="bg-linear-to-r from-sub2 to-main rounded-full h-full transition-all duration-500"
                        style={{ width: `${resolvedRate}%` }}
                    />
                </div>
            </div>

            {/* Weakest criterion */}
            <div className={CARD_CLASS}>
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Tiêu chí yếu nhất</span>
                        <p className="font-bold text-main text-xl tracking-tight">
                            {summary.weakestCriterion ? CRITERION_LABEL[summary.weakestCriterion.criterion] : 'Chưa có'}
                        </p>
                    </div>
                    <div className="flex justify-center items-center bg-sub1 rounded-lg size-10 text-main shrink-0">
                        <LuTarget className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <div className="flex items-center gap-1.5 font-medium text-subText text-xs">
                    <span className="bg-sub3 rounded-full size-2" aria-hidden="true" />
                    <span>
                        {summary.weakestCriterion
                            ? `${summary.weakestCriterion.count} lỗi chưa khắc phục ảnh hưởng tiêu chí này`
                            : 'Không còn lỗi nào cần khắc phục'}
                    </span>
                </div>
            </div>

            {/* Analysis coverage */}
            <div className="flex flex-col justify-between gap-4 bg-sub3/10 shadow-sm p-5 border border-sub3/50 rounded-xl">
                <div className="flex justify-between items-start gap-3">
                    <div className="space-y-1 min-w-0">
                        <span className={LABEL_CLASS}>Dữ liệu phân tích</span>
                        <div className="flex items-baseline gap-2">
                            <span className="font-bold text-main text-3xl tracking-tight">{summary.analyzedAttempts}</span>
                            <span className="font-semibold text-main/70 text-xs">bài đã chấm</span>
                        </div>
                    </div>
                    <div className="flex justify-center items-center bg-sub3 rounded-lg size-10 text-main shrink-0">
                        <LuHourglass className="size-5" aria-hidden="true" />
                    </div>
                </div>
                <p className="bg-card px-3 py-2 border border-sub3/40 rounded-lg font-medium text-main text-xs">
                    {summary.scoringAttempts} bài AI đang chấm · {summary.interruptedAttempts} bài gián đoạn — chưa tính
                    vào sổ lỗi
                </p>
            </div>
        </div>
    );
}
