'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LuChevronsUpDown, LuHistory, LuLogOut, LuUserRound } from 'react-icons/lu';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { CurrentUser } from '@/app/setting/profile/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { UserAvatar } from './user-avatar';

const ACCOUNT_LINKS = [
    { label: 'Hồ sơ cá nhân', href: '/setting/profile', Icon: LuUserRound },
    { label: 'Lịch sử làm bài', href: '/setting/history', Icon: LuHistory },
];

interface UserMenuProps {
    /** Sidebar đang thu gọn: chỉ còn avatar, tên & email ẩn đi giống nhãn các mục nav. */
    collapsed: boolean;
    user: CurrentUser;
}

/** Khối tài khoản ở đáy sidebar (kiểu NavUser của shadcn): avatar + tên, bấm để mở menu tài khoản. */
export function UserMenu({ collapsed, user }: UserMenuProps) {
    const router = useRouter();
    const isMobile = useIsMobile();

    const handleLogout = async () => {
        // signOut vẫn xoá phiên cục bộ kể cả khi gọi server lỗi, nên luôn đưa về trang chủ
        await supabase.auth.signOut();
        router.replace('/');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                className={cn(
                    'flex items-center gap-3 data-popup-open:bg-white/10 hover:bg-white/10 p-2 rounded-lg w-full overflow-hidden text-left transition-colors cursor-pointer',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sub3',
                )}
            >
                <UserAvatar user={user} size="lg" />
                <span
                    className={cn(
                        'flex-1 grid min-w-0 leading-tight transition-all duration-300',
                        collapsed && '-translate-x-3 opacity-0',
                    )}
                >
                    <span className="font-semibold text-white text-sm truncate">{user.name}</span>
                    <span className="text-sub1/70 text-xs truncate">{user.email}</span>
                </span>
                <LuChevronsUpDown
                    aria-hidden="true"
                    className={cn(
                        'size-4 text-sub1/70 transition-opacity duration-300 shrink-0',
                        collapsed && 'opacity-0',
                    )}
                />
            </DropdownMenuTrigger>

            {/* Desktop: bung sang phải, sideOffset = padding khung bọc (12px) + 8px để menu nằm ngoài mép sidebar */}
            <DropdownMenuContent
                side={isMobile ? 'top' : 'right'}
                align={isMobile ? 'start' : 'end'}
                sideOffset={isMobile ? 28 : 20}
                alignOffset={isMobile ? 0 : 50}
                className="w-60"
            >
                <DropdownMenuGroup>
                    <DropdownMenuLabel className="flex items-center gap-2 py-1.5 font-normal text-sm">
                        <UserAvatar user={user} />
                        <span className="flex-1 grid min-w-0 leading-tight">
                            <span className="font-semibold text-main truncate">{user.name}</span>
                            <span className="text-subText text-xs truncate">{user.email}</span>
                        </span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {ACCOUNT_LINKS.map(({ label, href, Icon }) => (
                        <DropdownMenuItem key={href} render={<Link href={href} />}>
                            <Icon aria-hidden="true" className="text-gray-00" />
                            {label}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LuLogOut aria-hidden="true" />
                    Đăng xuất
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
