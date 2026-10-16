import Link from 'next/link';
import { LuCalendarDays, LuHardDrive, LuHourglass, LuSparkles, LuTarget, LuUserPlus } from 'react-icons/lu';
import { buttonVariants } from '@/components/ui/button';
import { UserAvatar } from '@/components/user/user-avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Profile } from '@/lib/domain/types';
import { cn } from '@/lib/utils';
import { getDaysUntil, toPercent } from '../utils';

interface ProfileIdentityCardProps {
    /** `null` = khách. */
    profile: Profile | null;
    /** Lộ trình đang theo; `null` khi chưa có (khách luôn `null`). */
    plan: PlanSummary | null;
    className?: string;
}

interface PlanSummary {
    weekNo: number;
    /** Bài trong lộ trình xếp ở tháng này. */
    month: { completed: number; total: number };
}

const CHIP_CLASS =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider';

const META_CLASS =
    'inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 border border-sub1/15 rounded-lg min-w-0 backdrop-blur-sm';

const SIDE_CARD_CLASS =
    'flex flex-col bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-xl lg:w-80 overflow-hidden lg:rotate-1 hover:rotate-0 transition-transform duration-300 shrink-0';

const SIDE_HEADER_CLASS =
    'flex justify-between items-center gap-2 bg-sub3 px-5 py-2.5 border-black border-b-2 font-semibold text-[0.6875rem] text-main uppercase tracking-wider';

const DATE = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

function getCountdown(daysLeft: number) {
    if (daysLeft > 0) return { value: String(daysLeft), unit: 'ngày nữa' };
    if (daysLeft === 0) return { value: 'Hôm nay', unit: 'là ngày thi' };
    return { value: 'Đã thi', unit: `${-daysLeft} ngày trước` };
}

function ExamCountdown({ examDate, month }: { examDate: string; month: PlanSummary['month'] | null }) {
    const daysLeft = getDaysUntil(examDate);
    const countdown = getCountdown(daysLeft);
    const isUrgent = daysLeft >= 0 && daysLeft <= 14;

    return (
        <div className={SIDE_CARD_CLASS}>
            <div className={SIDE_HEADER_CLASS}>
                <span className="flex items-center gap-1.5">
                    <LuTarget className="size-4" aria-hidden="true" />
                    Ngày thi dự kiến
                </span>
                <span className="font-bold text-sm normal-case">{DATE.format(new Date(`${examDate}T00:00:00`))}</span>
            </div>
            <div className="flex items-center gap-4 p-5">
                <span
                    className={cn(
                        'flex justify-center items-center rounded-xl size-12 shrink-0',
                        isUrgent ? 'bg-sub3/20 text-main' : 'bg-sub1 text-main',
                    )}
                >
                    <LuHourglass className={cn('size-6', isUrgent && 'animate-pulse')} aria-hidden="true" />
                </span>
                <p className="flex flex-wrap items-baseline gap-x-2 text-main">
                    <span className="font-bold tabular-nums text-5xl tracking-tight">{countdown.value}</span>
                    <span className="font-semibold text-subText">{countdown.unit}</span>
                </p>
            </div>
            {month && (
                <div className="flex flex-col gap-1.5 px-5 pb-5">
                    <div className="flex justify-between items-center font-medium text-subText text-xs">
                        <span>Bài lộ trình tháng này</span>
                        <span className="font-bold tabular-nums text-main">
                            {month.completed}/{month.total}
                        </span>
                    </div>
                    <div
                        role="progressbar"
                        aria-label="Bài lộ trình đã hoàn thành trong tháng"
                        aria-valuemin={0}
                        aria-valuemax={month.total}
                        aria-valuenow={month.completed}
                        className="bg-sub1 border-2 border-black rounded-full h-3.5 overflow-hidden"
                    >
                        <div
                            className="bg-sub3 border-black border-r-2 h-full transition-all duration-700"
                            style={{ width: `${toPercent(month.completed, month.total)}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

/** Thay cho ngày thi khi chưa đặt; khách được mời đăng ký vì chỉ tài khoản mới có mục tiêu & ngày thi. */
function ExamDatePrompt({ isGuest }: { isGuest: boolean }) {
    return (
        <div className={SIDE_CARD_CLASS}>
            <div className={SIDE_HEADER_CLASS}>
                <span className="flex items-center gap-1.5">
                    <LuTarget className="size-4" aria-hidden="true" />
                    Ngày thi dự kiến
                </span>
                <span className="font-bold text-sm normal-case">Chưa đặt</span>
            </div>
            <div className="flex flex-col gap-3 p-5">
                <p className="font-medium text-subText text-sm">
                    {isGuest
                        ? 'Đăng ký tài khoản để đặt ngày thi, mục tiêu điểm và nhận lộ trình học.'
                        : 'Đặt ngày thi để theo dõi số ngày còn lại.'}
                </p>
                {isGuest && (
                    <Link href="/register" className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'gap-2')}>
                        <LuUserPlus className="size-4" aria-hidden="true" />
                        Đăng ký
                    </Link>
                )}
            </div>
        </div>
    );
}

/** Banner đầu trang: danh tính người học và đếm ngược tới ngày thi. */
export default function ProfileIdentityCard({ profile, plan, className }: ProfileIdentityCardProps) {
    // Tên và avatar nằm ở auth metadata, `profiles` chỉ giữ dữ liệu của app
    const user = useCurrentUser();
    const name = profile ? (user?.name ?? 'Học viên') : 'Khách';
    const initials = name
        .split(/\s+/)
        .slice(-2)
        .map((word) => word[0])
        .join('')
        .toUpperCase();

    return (
        <section
            aria-labelledby="profile-name"
            className={cn(
                'isolate relative flex lg:flex-row flex-col justify-between lg:items-center gap-8 bg-main px-6 sm:px-10 py-8 sm:py-10 rounded-2xl overflow-hidden',
                className,
            )}
        >
            {/* Hoạ tiết trang trí: quầng sáng + vòng tròn */}
            <div aria-hidden="true" className="-z-10 absolute inset-0">
                <div className="-right-10 -bottom-24 absolute bg-sub3/25 blur-3xl rounded-full size-80" />
                <div className="-top-24 -right-16 absolute border-2 border-sub1/10 rounded-full size-80" />
                <div className="-top-8 right-0 absolute border-2 border-sub1/10 rounded-full size-48" />
                <div className="right-1/3 bottom-6 absolute bg-sub3 rounded-full size-2" />
                <div className="top-8 left-2/3 absolute bg-sub1/40 rounded-full size-1.5" />
                <div className="top-12 left-1/2 absolute bg-sub1/40 rounded-full size-1.5" />
            </div>

            <div className="flex sm:flex-row flex-col sm:items-center gap-6">
                <div className="relative self-start sm:self-auto shrink-0">
                    <div className="rounded-full">
                        <UserAvatar
                            user={{ initials, avatarUrl: profile ? user?.avatarUrl : undefined }}
                            className="size-24 sm:size-28"
                            fallbackClassName="text-3xl"
                        />
                    </div>
                    {plan && (
                        <span className="-bottom-1 left-1/2 absolute bg-sub3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-0.5 border-2 border-black rounded-md font-bold text-[0.6875rem] text-main whitespace-nowrap -translate-x-1/2">
                            Tuần {plan.weekNo}
                        </span>
                    )}
                </div>

                <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>
                            {!profile ? 'Chế độ khách' : profile.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                        </span>
                        {plan && (
                            <span className={cn(CHIP_CLASS, 'bg-white/10 text-sub1 ring-1 ring-sub1/20')}>
                                <LuSparkles className="size-3 text-sub3" aria-hidden="true" />
                                Đang theo lộ trình
                            </span>
                        )}
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-medium text-sub1/80 text-sm">Chào mừng trở lại,</p>
                        <h2
                            id="profile-name"
                            className="font-bold text-white text-3xl sm:text-4xl wrap-break-word tracking-tight"
                        >
                            {name}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 font-medium text-sub1 text-sm">
                        {profile ? (
                            <span className={META_CLASS}>
                                <LuCalendarDays className="size-4 shrink-0" aria-hidden="true" />
                                Tham gia {DATE.format(new Date(profile.created_at))}
                            </span>
                        ) : (
                            <span className={META_CLASS}>
                                <LuHardDrive className="size-4 shrink-0" aria-hidden="true" />
                                Bài làm chỉ lưu trên trình duyệt này
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {profile?.exam_date ? (
                <ExamCountdown examDate={profile.exam_date} month={plan?.month ?? null} />
            ) : (
                <ExamDatePrompt isGuest={!profile} />
            )}
        </section>
    );
}
