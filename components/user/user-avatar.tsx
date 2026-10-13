import type { ComponentProps } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { CurrentUser } from '@/app/setting/profile/types';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
    user: Pick<CurrentUser, 'initials' | 'avatarUrl'>;
    size?: ComponentProps<typeof Avatar>['size'];
    className?: string;
    fallbackClassName?: string;
}

/** Avatar luôn đứng cạnh tên người dùng nên được ẩn khỏi trình đọc màn hình để không đọc lặp. */
export function UserAvatar({ user, size, className, fallbackClassName }: UserAvatarProps) {
    return (
        <Avatar size={size} aria-hidden="true" className={className}>
            <AvatarImage src={user.avatarUrl} alt="" />
            <AvatarFallback className={cn('bg-sub3 font-bold text-main', fallbackClassName)}>
                {user.initials}
            </AvatarFallback>
        </Avatar>
    );
}
