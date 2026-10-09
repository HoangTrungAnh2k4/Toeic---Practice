'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { IconType } from 'react-icons';
import { IoBook, IoCalendar, IoChevronBack, IoCompass, IoHome } from 'react-icons/io5';

/**
 * Chiều cao mỗi mục. PHẢI khớp với class `h-16` (64px) bên dưới,
 * vì thanh trượt (indicator) được dịch chuyển theo index * ITEM_H.
 */
const ITEM_H = 64;

type NavItem = { label: string; href: string; icon: IconType };

const items: NavItem[] = [
    { label: 'Dashboard', href: '/dashboard', icon: IoHome },
    { label: 'Explore', href: '/explore', icon: IoCompass },
    { label: 'Dictionary', href: '/dictionary', icon: IoBook },
    { label: 'Schedule', href: '/schedule', icon: IoCalendar },
];

export function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);

    const activeIndex = items.findIndex((item) => pathname === item.href || pathname.startsWith(item.href + '/'));

    return (
        <aside
            className={`sidebar-root relative z-10 flex shrink-0 flex-col bg-gradient-to-br from-[#4b3f72] via-[#3d3460] to-[#2c2547] transition-[width] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)] ${
                collapsed ? 'w-24' : 'w-72'
            }`}
        >
            <style>{`
        @keyframes sidebar-in {
          from { opacity: 0; transform: translateX(-24px); }
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
            <div className="flex justify-between items-center px-6 pt-4 h-24">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex justify-center items-center bg-white/15 rounded-xl w-10 h-10 font-bold text-white text-lg shrink-0">
                        L
                    </div>
                    <span
                        className={`whitespace-nowrap text-lg font-semibold text-white transition-all duration-300 ${
                            collapsed ? 'w-0 opacity-0' : 'opacity-100'
                        }`}
                    >
                        Learnly
                    </span>
                </div>
                <button
                    type="button"
                    onClick={() => setCollapsed((v) => !v)}
                    aria-label={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:scale-110 hover:bg-white/20 active:scale-90 ${
                        collapsed ? 'absolute right-2 top-9 rotate-180' : ''
                    }`}
                >
                    <IoChevronBack className="w-4 h-4" />
                </button>
            </div>

            <nav className="relative mt-4">
                {/* Thanh trượt: pill sáng + 2 góc bo ngược (trên & dưới) nối liền với nội dung */}
                <div
                    aria-hidden
                    className={`pointer-events-none absolute -right-px left-4 top-0 h-16 rounded-l-full bg-[#eef0fc] transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.34,1.4,0.64,1)] before:absolute before:-top-8 before:right-0 before:h-8 before:w-8 before:bg-[radial-gradient(circle_at_0_0,transparent_31.5px,#eef0fc_32px)] before:content-[''] after:absolute after:-bottom-8 after:right-0 after:h-8 after:w-8 after:bg-[radial-gradient(circle_at_0_100%,transparent_31.5px,#eef0fc_32px)] after:content-[''] ${
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
                                    aria-current={active ? 'page' : undefined}
                                    className={`group relative z-10 flex h-16 items-center gap-4 transition-[padding] duration-500 ${
                                        collapsed ? 'pl-11' : 'pl-9'
                                    }`}
                                >
                                    <Icon
                                        // key đổi theo active để chạy lại animation "pop" mỗi lần được chọn
                                        key={active ? 'on' : 'off'}
                                        className={`h-6 w-6 shrink-0 transition-all duration-300 group-hover:-rotate-12 group-hover:scale-125 ${
                                            active ? 'text-[#1f1b2e]' : 'text-[#a29db8]'
                                        }`}
                                        style={active ? { animation: 'sidebar-pop 500ms ease-out both' } : undefined}
                                    />
                                    <span
                                        className={`whitespace-nowrap text-[15px] font-medium transition-all duration-300 group-hover:translate-x-1 ${
                                            active ? 'text-[#1f1b2e]' : 'text-white/90'
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
        </aside>
    );
}
