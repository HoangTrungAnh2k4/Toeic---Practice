import Link from 'next/link';
import type { IconType } from 'react-icons';
import { LuCheck, LuEye, LuFlaskConical, LuRepeat } from 'react-icons/lu';
import { getAttemptHref } from '@/app/setting/history/utils';
import { FrequencyMeter } from '@/components/mistakes/frequency-meter';
import { MistakeStatusBadge } from '@/components/mistakes/mistake-badges';
import { cn } from '@/lib/utils';
import { MistakeCheck, MistakeDetail } from '../../types';
import { RESOLVE_STREAK, STATUS_META } from '../../utils';

interface MistakeProgressProps {
    mistake: MistakeDetail;
}

type CheckKind = 'hit' | 'clean' | 'assisted';

/** Mỗi ô phân biệt bằng icon + nhãn, không chỉ bằng màu. */
const CHECK_META: Record<CheckKind, { label: string; Icon: IconType; className: string }> = {
    hit: { label: 'Lặp lại', Icon: LuRepeat, className: 'bg-sub3 text-main' },
    clean: { label: 'Không lặp lại', Icon: LuCheck, className: 'bg-main text-sub1' },
    assisted: { label: 'Có xem mẫu (không tính)', Icon: LuEye, className: 'bg-sub1 text-main ring-1 ring-inset ring-sub2/60' },
};

const getKind = (check: MistakeCheck): CheckKind => (check.hit ? 'hit' : check.assisted ? 'assisted' : 'clean');

function getStreakMessage({ status, cleanStreak }: MistakeDetail) {
    if (status === 'resolved') return `Đã giữ ${cleanStreak} bài độc lập liên tiếp. Lỗi sẽ tự mở lại nếu xuất hiện.`;
    if (status === 'improving') return `Còn ${RESOLVE_STREAK - cleanStreak} bài độc lập nữa không lặp lại để đánh dấu đã khắc phục.`;
    return `Cần ${RESOLVE_STREAK} bài độc lập liên tiếp không lặp lại để đánh dấu đã khắc phục.`;
}

export default function MistakeProgress({ mistake }: MistakeProgressProps) {
    // Cửa sổ lưu mới → cũ; hiển thị theo thời gian từ trái sang phải
    const timeline = [...mistake.window].reverse();
    const streak = Math.min(mistake.cleanStreak, RESOLVE_STREAK);
    const needsMoreData = mistake.status !== 'resolved' && mistake.frequency.total < 2;

    return (
        <section
            aria-labelledby="mistake-progress-title"
            className="flex flex-col gap-4 bg-card shadow-sm p-5 border border-sub2/30 rounded-xl"
        >
            <div className="flex justify-between items-start gap-2">
                <div className="flex flex-col gap-1">
                    <span className="font-semibold text-subText text-xs uppercase tracking-wider">Tiến độ khắc phục</span>
                    <h2 id="mistake-progress-title" className="font-bold text-main text-lg tracking-tight">
                        {STATUS_META[mistake.status].description}
                    </h2>
                </div>
                <MistakeStatusBadge status={mistake.status} className="shrink-0" />
            </div>

            {/* Streak */}
            <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center font-semibold text-main text-xs">
                    <span>Chuỗi bài không lặp lại</span>
                    <span className="tabular-nums">
                        {streak}/{RESOLVE_STREAK}
                    </span>
                </div>
                <div
                    role="progressbar"
                    aria-label="Chuỗi bài độc lập không lặp lại"
                    aria-valuemin={0}
                    aria-valuemax={RESOLVE_STREAK}
                    aria-valuenow={streak}
                    className="flex gap-1"
                >
                    {Array.from({ length: RESOLVE_STREAK }, (_, i) => (
                        <span key={i} className={cn('flex-1 rounded-full h-2', i < streak ? 'bg-main' : 'bg-sub1')} />
                    ))}
                </div>
                <p className="font-medium text-subText text-xs leading-relaxed">{getStreakMessage(mistake)}</p>
            </div>

            {/* Timeline */}
            <div className="flex flex-col gap-2 pt-4 border-sub2/20 border-t">
                <div className="flex justify-between items-center gap-2">
                    <span className="font-semibold text-main text-xs">Các bài gần nhất cùng dạng</span>
                    <FrequencyMeter hit={mistake.frequency.hit} total={mistake.frequency.total} />
                </div>
                {timeline.length === 0 ? (
                    <p className="text-subText text-xs">Chưa có bài đã chấm nào thuộc dạng câu này.</p>
                ) : (
                    <ol className="flex flex-wrap gap-2">
                        {timeline.map((check) => {
                            const meta = CHECK_META[getKind(check)];
                            return (
                                <li key={check.attemptId}>
                                    <Link
                                        href={getAttemptHref(check.attemptId)}
                                        aria-label={`${check.code}, ${check.submittedAt}: ${meta.label}`}
                                        title={`${check.title} · ${check.submittedAt}`}
                                        className="flex flex-col items-center gap-1 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sub3 group/check"
                                    >
                                        <span
                                            className={cn(
                                                'flex justify-center items-center rounded-lg size-9 group-hover/check:scale-105 transition-transform',
                                                meta.className,
                                            )}
                                        >
                                            <meta.Icon className="size-4" aria-hidden="true" />
                                        </span>
                                        <span className="font-semibold text-[0.6875rem] text-subText tabular-nums">
                                            {check.code.replace('#ATT-', '')}
                                        </span>
                                    </Link>
                                </li>
                            );
                        })}
                    </ol>
                )}
                <ul className="flex flex-wrap gap-x-3 gap-y-1 font-medium text-[0.6875rem] text-subText" aria-label="Chú thích">
                    {Object.values(CHECK_META).map(({ label, Icon }) => (
                        <li key={label} className="flex items-center gap-1">
                            <Icon className="size-3" aria-hidden="true" />
                            {label}
                        </li>
                    ))}
                </ul>
            </div>

            {needsMoreData && (
                <p className="flex items-start gap-2 bg-sub3/10 p-3 border border-sub3/50 rounded-lg font-medium text-main text-xs">
                    <LuFlaskConical className="mt-px size-4 shrink-0" aria-hidden="true" />
                    Mới ghi nhận ở {mistake.frequency.total} bài nên độ ưu tiên đang được giảm. Làm thêm bài cùng dạng
                    để xác nhận.
                </p>
            )}
        </section>
    );
}
