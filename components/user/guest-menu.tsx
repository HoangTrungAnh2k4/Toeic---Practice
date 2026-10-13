import Link from 'next/link';
import { LuLogIn, LuUserRound } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';

interface GuestMenuProps {
    /** Sidebar đang thu gọn: chỉ còn nút đăng nhập dạng icon. */
    collapsed: boolean;
}

/** Khối ở đáy sidebar khi chưa đăng nhập: mời đăng nhập / đăng ký để lưu tiến độ. */
export function GuestMenu({ collapsed }: GuestMenuProps) {
    if (collapsed) {
        return (
            <LinkButton
                href="/login"
                aria-label="Đăng nhập"
                title="Đăng nhập" variant="primary" size="md" className="mx-auto size-10 px-0"
            >
                <LuLogIn aria-hidden="true" className="size-5" />
            </LinkButton>
        );
    }

    return (
        <div className="flex flex-col gap-3 bg-white/10 p-3 border border-sub1/20 rounded-xl overflow-hidden animate-in duration-300 fade-in">
            <div className="flex items-center gap-3 min-w-0">
                <span className="flex justify-center items-center bg-sub1/15 rounded-full size-10 shrink-0">
                    <LuUserRound aria-hidden="true" className="size-5 text-sub1" />
                </span>
                <span className="grid min-w-0 leading-tight">
                    <span className="font-semibold text-white text-sm truncate">Bạn chưa đăng nhập</span>
                    <span className="text-sub1/70 text-xs truncate">Đăng nhập để lưu tiến độ</span>
                </span>
            </div>

            <LinkButton href="/login" variant="primary" size="sm" className="gap-2 w-full">
                <LuLogIn aria-hidden="true" className="size-4" />
                Đăng nhập
            </LinkButton>
            <p className="text-sub1/70 text-xs text-center">
                Chưa có tài khoản?{' '}
                <Link
                    href="/register"
                    className="rounded-sm focus-visible:outline-2 focus-visible:outline-sub3 font-semibold text-sub3 hover:underline underline-offset-2"
                >
                    Đăng ký
                </Link>
            </p>
        </div>
    );
}
