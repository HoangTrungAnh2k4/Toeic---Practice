import { LuCalendarDays, LuHardDrive } from 'react-icons/lu';
import { UserAvatar } from '@/components/user/user-avatar';
import { useCurrentUser } from '@/hooks/use-current-user';
import type { Profile } from '@/lib/domain/types';
import { cn } from '@/lib/utils';

interface ProfileIdentityCardProps {
    /** `null` = khách. */
    profile: Profile | null;
    className?: string;
}

const CHIP_CLASS =
    'inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[0.6875rem] uppercase tracking-wider';

const META_CLASS =
    'inline-flex items-center gap-1.5 bg-white/10 px-3 py-1.5 border border-sub1/15 rounded-lg min-w-0 backdrop-blur-sm';

const DATE = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

/** Banner đầu trang: danh tính người học. */
export default function ProfileIdentityCard({ profile, className }: ProfileIdentityCardProps) {
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
                </div>

                <div className="flex flex-col gap-3 min-w-0">
                    <div className="flex flex-wrap gap-2">
                        <span className={cn(CHIP_CLASS, 'bg-sub1 text-main')}>
                            {!profile ? 'Chế độ khách' : profile.role === 'admin' ? 'Quản trị viên' : 'Học viên'}
                        </span>
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
        </section>
    );
}
