import { LuCalendarDays, LuMail } from 'react-icons/lu';
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
    'inline-flex items-center px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider';

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

    return (
        <section
            aria-labelledby="profile-name"
            className={cn(
                'relative flex lg:flex-row flex-col justify-between lg:items-center gap-6 bg-main px-6 sm:px-10 py-8 rounded-2xl overflow-hidden',
                className,
            )}
        >
            {/* Hoạ tiết vòng tròn trang trí */}
            <div
                aria-hidden="true"
                className="-top-24 -right-16 absolute border-2 border-sub1/10 rounded-full size-80"
            />
            <div aria-hidden="true" className="-top-8 right-0 absolute border-2 border-sub1/10 rounded-full size-48" />

            <div className="relative flex sm:flex-row flex-col sm:items-center gap-5">
                <UserAvatar user={user} className="ring-4 ring-sub1 size-24" fallbackClassName="text-3xl" />
                <div className="flex flex-col gap-2 min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>{user.role}</span>
                        <span className={cn(CHIP_CLASS, 'bg-sub3 text-main')}>Lộ trình · Tuần {weekIndex}</span>
                    </div>
                    <h2 id="profile-name" className="font-bold text-white text-2xl sm:text-3xl tracking-tight">
                        {user.name}
                    </h2>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 font-medium text-sub1 text-sm">
                        <span className="flex items-center gap-1.5 min-w-0">
                            <LuMail className="size-4 shrink-0" aria-hidden="true" />
                            <span className="truncate">{user.email}</span>
                        </span>
                        <span className="flex items-center gap-1.5">
                            <LuCalendarDays className="size-4 shrink-0" aria-hidden="true" />
                            Tham gia {user.joinedAt}
                        </span>
                    </div>
                </div>
            </div>

            {/* Đếm ngược ngày thi */}
            <div className="relative flex flex-col gap-2.5 bg-card shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5 border-2 border-black rounded-xl lg:w-72 shrink-0">
                <span className="font-medium text-subText text-xs uppercase tracking-wider">
                    Ngày thi dự kiến · {examDate}
                </span>
                <p className="flex items-baseline gap-2 text-main">
                    <span className="font-bold text-4xl tracking-tight">{countdown.value}</span>
                    <span className="font-medium">{countdown.unit}</span>
                </p>
                <div
                    role="progressbar"
                    aria-label="Buổi học đã hoàn thành trong tháng"
                    aria-valuemin={0}
                    aria-valuemax={sessions.total}
                    aria-valuenow={sessions.completed}
                    className="bg-sub2/30 rounded-full h-2 overflow-hidden"
                >
                    <div className="bg-sub3 rounded-full h-full" style={{ width: `${sessionPercent}%` }} />
                </div>
                <span className="font-medium text-subText text-xs">
                    {sessions.completed}/{sessions.total} buổi tháng này · {sessions.note}
                </span>
            </div>
        </section>
    );
}
