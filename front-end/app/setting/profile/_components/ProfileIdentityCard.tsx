import { LuCalendarDays, LuHourglass, LuMail, LuSparkles, LuTarget } from 'react-icons/lu';
import { UserAvatar } from '@/components/user/user-avatar';
import { cn } from '@/lib/utils';
import { CurrentUser } from '../types';
import { toPercent } from '../utils';

interface ProfileIdentityCardProps {
    user: CurrentUser;
    weekIndex: number;
    examDate: string;
    /** null khi ngày thi sai định dạng. */
    daysLeft: number | null;
    sessions: { completed: number; total: number; note: string };
    className?: string;
}

const CHIP_CLASS =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider';

const META_CLASS =
    'inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 border border-sub1/15 rounded-lg min-w-0 backdrop-blur-sm';

function getCountdown(daysLeft: number | null) {
    if (daysLeft === null) return { value: '—', unit: 'Chưa đặt ngày thi' };
    if (daysLeft > 0) return { value: String(daysLeft), unit: 'ngày nữa' };
    if (daysLeft === 0) return { value: 'Hôm nay', unit: 'là ngày thi' };
    return { value: 'Đã thi', unit: `${-daysLeft} ngày trước` };
}

/** Banner đầu trang: danh tính người học và đếm ngược tới ngày thi. */
export default function ProfileIdentityCard({
    user,
    weekIndex,
    examDate,
    daysLeft,
    sessions,
    className,
}: ProfileIdentityCardProps) {
    const countdown = getCountdown(daysLeft);
    const sessionPercent = toPercent(sessions.completed, sessions.total);
    const isUrgent = daysLeft !== null && daysLeft >= 0 && daysLeft <= 14;

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
                <div className="-top-20 -left-16 absolute bg-sub2/40 blur-3xl rounded-full size-72" />
                <div className="-right-10 -bottom-24 absolute bg-sub3/25 blur-3xl rounded-full size-80" />
                <div className="-top-24 -right-16 absolute border-2 border-sub1/10 rounded-full size-80" />
                <div className="-top-8 right-0 absolute border-2 border-sub1/10 rounded-full size-48" />
                <div className="right-1/3 bottom-6 absolute bg-sub3 rounded-full size-2" />
                <div className="top-8 left-1/2 absolute bg-sub1/40 rounded-full size-1.5" />
            </div>

            <div className="flex sm:flex-row flex-col sm:items-center gap-6">
                {/* Avatar có viền gradient + huy hiệu tuần */}
                <div className="relative self-start sm:self-auto shrink-0">
                    <div className="bg-linear-to-br from-sub3 via-sub1 to-sub2 p-1 rounded-full">
                        <UserAvatar user={user} className="ring-4 ring-main size-24 sm:size-28" fallbackClassName="text-3xl" />
                    </div>
                    <span className="-bottom-1 left-1/2 absolute bg-sub3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] px-2 py-0.5 border-2 border-black rounded-md font-bold text-[0.6875rem] text-main whitespace-nowrap -translate-x-1/2">
                        Tuần {weekIndex}
                    </span>
                </div>

                <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>{user.role}</span>
                        <span className={cn(CHIP_CLASS, 'bg-white/10 text-sub1 ring-1 ring-sub1/20')}>
                            <LuSparkles className="size-3 text-sub3" aria-hidden="true" />
                            Đang theo lộ trình
                        </span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="font-medium text-sub1/80 text-sm">Chào mừng trở lại,</p>
                        <h2
                            id="profile-name"
                            className="font-bold text-white text-3xl sm:text-4xl wrap-break-word tracking-tight"
                        >
                            {user.name}
                        </h2>
                    </div>
                    <div className="flex flex-wrap gap-2 font-medium text-sub1 text-sm">
                        <span className={META_CLASS}>
                            <LuMail className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{user.email}</span>
                        </span>
                        <span className={META_CLASS}>
                            <LuCalendarDays className="size-4 shrink-0" aria-hidden="true" />
                            Tham gia {user.joinedAt}
                        </span>
                    </div>
                </div>
            </div>

            {/* Đếm ngược ngày thi */}
            <div className="flex flex-col bg-card shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] border-2 border-black rounded-xl lg:w-80 overflow-hidden lg:rotate-1 hover:rotate-0 transition-transform duration-300 shrink-0">
                <div className="flex justify-between items-center gap-2 bg-sub3 px-5 py-2.5 border-black border-b-2">
                    <span className="flex items-center gap-1.5 font-semibold text-[0.6875rem] text-main uppercase tracking-wider">
                        <LuTarget className="size-4" aria-hidden="true" />
                        Ngày thi dự kiến
                    </span>
                    <span className="font-bold text-main text-sm">{examDate}</span>
                </div>

                <div className="flex flex-col gap-3 p-5">
                    <div className="flex items-center gap-4">
                        <span
                            className={cn(
                                'flex justify-center items-center rounded-xl size-12 shrink-0',
                                isUrgent ? 'bg-sub3/20 text-main' : 'bg-sub1 text-main',
                            )}
                        >
                            <LuHourglass className={cn('size-6', isUrgent && 'animate-pulse')} aria-hidden="true" />
                        </span>
                        <p className="flex flex-wrap items-baseline gap-x-2 text-main">
                            <span className="font-bold text-5xl tabular-nums tracking-tight">{countdown.value}</span>
                            <span className="font-semibold text-subText">{countdown.unit}</span>
                        </p>
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-center font-medium text-subText text-xs">
                            <span>Buổi học tháng này</span>
                            <span className="font-bold text-main tabular-nums">
                                {sessions.completed}/{sessions.total}
                            </span>
                        </div>
                        <div
                            role="progressbar"
                            aria-label="Buổi học đã hoàn thành trong tháng"
                            aria-valuemin={0}
                            aria-valuemax={sessions.total}
                            aria-valuenow={sessions.completed}
                            className="bg-sub1 border-2 border-black rounded-full h-3.5 overflow-hidden"
                        >
                            <div
                                className="bg-sub3 border-black border-r-2 h-full transition-all duration-700"
                                style={{ width: `${sessionPercent}%` }}
                            />
                        </div>
                        <span className="font-medium text-subText text-xs">{sessions.note}</span>
                    </div>
                </div>
            </div>
        </section>
    );
}
