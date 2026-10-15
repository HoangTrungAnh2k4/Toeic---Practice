'use client';

import { useState } from 'react';
import { LuMenu, LuX } from 'react-icons/lu';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { IoBook, IoCalendar, IoSettings } from 'react-icons/io5';
import { TbLayoutDashboardFilled } from 'react-icons/tb';
import { FaMicrophoneAlt } from 'react-icons/fa';
import { FaPenNib } from 'react-icons/fa6';
import { UserMenu } from '@/components/user/user-menu';
import { GuestMenu } from '@/components/user/guest-menu';
import { useCurrentUser } from '@/hooks/use-current-user';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

/**
 * Chiều cao mỗi mục. PHẢI khớp với class `h-16` (64px) bên dưới,
 * vì thanh trượt (indicator) được dịch chuyển theo index * ITEM_H.
 */
const ITEM_H = 64;

type NavItem = { label: string; href: string; icon: IconType };

const items: NavItem[] = [
    { label: 'Overview', href: '/overview', icon: TbLayoutDashboardFilled },
    { label: 'Speaking', href: '/speaking', icon: FaMicrophoneAlt },
    { label: 'Writing', href: '/writing', icon: FaPenNib },
    { label: 'Mistakes', href: '/mistakes', icon: IoBook },
    { label: 'Schedule', href: '/schedule', icon: IoCalendar },
    { label: 'Setting', href: '/setting', icon: IoSettings },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const user = useCurrentUser();

    const activeIndex = items.findIndex((item) => pathname === item.href || pathname.startsWith(item.href + '/'));

    return (
        <>
            <MobileTopBar activeIndex={activeIndex} user={user} />
            <aside
                className={`sidebar-root sticky top-0 z-10 hidden md:flex h-dvh shrink-0 flex-col self-start bg-main to-main transition-[width] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                    collapsed ? 'w-20' : 'w-64'
                }`}
            >
                <style>{`
        @keyframes sidebar-in {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: none; }
        }
        @keyframes sidebar-pop {
          0%   { transform: scale(0.6) rotate(-20deg); }
          60%  { transform: scale(1.3) rotate(8deg); }
          100% { transform: scale(1.1) rotate(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .sidebar-root, .sidebar-root * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>

                {/* Header: logo + nút thu gọn */}
                <div className="flex justify-end items-center pt-4 h-24">
                    {/*
                  Cả 2 logo luôn được render chồng lên nhau và chuyển đổi bằng transition
                  (crossfade + trượt + scale) theo `collapsed`. Nhờ vậy cả logo đầy đủ lẫn
                  logo thu gọn đều có animation cả khi hiện lẫn khi ẩn, đồng bộ với độ rộng sidebar.
                */}
                    <button
                        type="button"
                        onClick={() => setCollapsed((v) => !v)}
                        aria-label={collapsed ? 'Mở rộng thanh bên' : 'Thu gọn thanh bên'}
                        aria-expanded={!collapsed}
                        className="group relative w-full h-13 cursor-pointer"
                        style={{ animation: 'sidebar-in 500ms ease-out both' }}
                    >
                        {/* Logo đầy đủ */}
                        <span
                            aria-hidden={collapsed}
                            className={`absolute inset-0 transition-all duration-1000 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
                                collapsed
                                    ? 'pointer-events-none -translate-x-6 scale-75 opacity-0'
                                    : 'translate-x-0 scale-100 opacity-100'
                            }`}
                        >
                            <Image
                                src="/img/logo.png"
                                alt="Learnly Logo"
                                fill
                                sizes="10"
                                className="outline-none focus-visible:outline-none focus:outline-none object-contain group-hover:scale-102 transition-transform duration-300"
                            />
                        </span>

                        {/* Logo thu gọn */}
                        <span
                            aria-hidden={!collapsed}
                            className={`absolute inset-x-0 inset-y-1 transition-all duration-1000 ease-[cubic-bezier(0.34,1.4,0.64,1)] ${
                                collapsed
                                    ? 'translate-x-0 scale-100 rotate-0 opacity-100'
                                    : 'pointer-events-none translate-x-6 scale-50 -rotate-12 opacity-0'
                            }`}
                        >
                            <Image
                                src="/img/sub_logo.png"
                                alt="Learnly Logo"
                                fill
                                sizes="10"
                                className="object-contain group-hover:rotate-6 group-hover:scale-110 transition-transform"
                            />
                        </span>
                    </button>
                </div>

                <SidebarNav activeIndex={activeIndex} collapsed={collapsed} />

                {/* Tài khoản: ghim đáy sidebar, xuất hiện ngay sau mục nav cuối */}
                <div
                    className="mt-auto p-3"
                    style={{
                        animation: `sidebar-in 600ms ${150 + items.length * 90}ms cubic-bezier(0.22,1,0.36,1) both`,
                    }}
                >
                    {user ? <UserMenu collapsed={collapsed} user={user} /> : <GuestMenu collapsed={collapsed} />}
                </div>
            </aside>
        </>
    );
}

interface SidebarNavProps {
    activeIndex: number;
    collapsed: boolean;
    /** Gọi khi chọn một mục (đóng drawer trên mobile). */
    onNavigate?: () => void;
}

function SidebarNav({ activeIndex, collapsed, onNavigate }: SidebarNavProps) {
    return (
        <nav className="relative mt-4">
            {/* Thanh trượt: pill sáng + 2 góc bo ngược (trên & dưới) nối liền với nội dung */}
            <div
                aria-hidden
                className={`pointer-events-none absolute -right-px left-1 top-0 h-16 rounded-l-full bg-[#eef0fc] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] before:absolute before:-top-8 before:right-0 before:h-8 before:w-8 before:bg-[radial-gradient(circle_at_0_0,transparent_31.5px,#eef0fc_32px)] before:content-[''] after:absolute after:-bottom-8 after:right-0 after:h-8 after:w-8 after:bg-[radial-gradient(circle_at_0_100%,transparent_31.5px,#eef0fc_32px)] after:content-[''] ${
                    activeIndex < 0 ? 'opacity-0' : 'opacity-100'
                }`}
                style={{ transform: `translateY(${Math.max(activeIndex, 0) * ITEM_H}px)` }}
            />

            <ul>
                {items.map((item, i) => {
                    const active = i === activeIndex;
                    const Icon = item.icon;

                    return (
                        <li
                            key={item.href}
                            style={{
                                animation: `sidebar-in 600ms ${150 + i * 90}ms cubic-bezier(0.22,1,0.36,1) both`,
                            }}
                        >
                            <Link
                                href={item.href}
                                onClick={onNavigate}
                                aria-current={active ? 'page' : undefined}
                                className={`group relative z-10 flex h-16 items-center gap-4 transition-[padding] duration-500 ${!active ? 'hover:bg-white/10' : ''} ${
                                    collapsed ? 'pl-6' : 'pl-9'
                                }`}
                            >
                                <Icon
                                    // key đổi theo active để chạy lại animation "pop" mỗi lần được chọn
                                    key={active ? 'on' : 'off'}
                                    className={`h-6 w-6 shrink-0 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-110 ${
                                        active ? 'text-black' : 'text-white'
                                    }`}
                                    style={active ? { animation: 'sidebar-pop 500ms ease-out both' } : undefined}
                                />
                                <span
                                    className={`whitespace-nowrap text-base font-medium transition-all duration-300 group-hover:translate-x-1 ${
                                        active ? 'text-black' : 'text-white'
                                    } ${collapsed ? 'pointer-events-none -translate-x-3 opacity-0' : 'opacity-100'}`}
                                >
                                    {item.label}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}

interface MobileTopBarProps {
    activeIndex: number;
    user: ReturnType<typeof useCurrentUser>;
}

/** Dưới `md`: thanh trên cùng với logo + nút mở drawer chứa nav và khối tài khoản. */
function MobileTopBar({ activeIndex, user }: MobileTopBarProps) {
    const [open, setOpen] = useState(false);
    const close = () => setOpen(false);

    return (
        <header className="md:hidden top-0 z-20 sticky flex justify-between items-center bg-main px-4 h-14">
            <Link href="/overview" aria-label="Về trang Overview" className="relative w-28 h-9">
                <Image src="/img/logo.png" alt="" fill sizes="112px" className="object-contain object-left" />
            </Link>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger
                    aria-label="Mở menu điều hướng"
                    className="flex justify-center items-center hover:bg-white/10 rounded-lg size-10 text-white focus-visible:outline-2 focus-visible:outline-sub3 cursor-pointer"
                >
                    <LuMenu aria-hidden="true" className="size-6" />
                </SheetTrigger>
                <SheetContent side="left" showCloseButton={false} className="gap-0 bg-main border-none w-64">
                    <div className="flex justify-between items-center pr-3 pl-4 h-20">
                        <SheetTitle className="sr-only">Điều hướng</SheetTitle>
                        <div className="relative w-36 h-10">
                            <Image
                                src="/img/logo.png"
                                alt=""
                                fill
                                sizes="144px"
                                className="object-contain object-left"
                            />
                        </div>
                        <SheetClose
                            aria-label="Đóng menu"
                            className="flex justify-center items-center hover:bg-white/10 rounded-lg size-10 text-white focus-visible:outline-2 focus-visible:outline-sub3 cursor-pointer"
                        >
                            <LuX aria-hidden="true" className="size-5" />
                        </SheetClose>
                    </div>
                    <SidebarNav activeIndex={activeIndex} collapsed={false} onNavigate={close} />
                    <div className="mt-auto p-3">
                        {user ? <UserMenu collapsed={false} user={user} /> : <GuestMenu collapsed={false} />}
                    </div>
                </SheetContent>
            </Sheet>
        </header>
    );
}

/**
 * Khung giữ chỗ khi `usePathname` chưa resolve (route có param động như `/mistakes/[id]`),
 * cùng kích thước sidebar mở rộng để không bị giật layout.
 */
export function SidebarFallback() {
    return (
        <>
            <div aria-hidden="true" className="md:hidden top-0 z-20 sticky bg-main h-14" />
            <div aria-hidden="true" className="hidden md:block top-0 sticky self-start bg-main w-64 h-dvh shrink-0" />
        </>
    );
}
