import Image from 'next/image';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NAV = [
    { label: 'Tính năng', href: '#tinh-nang' },
    { label: 'Cách hoạt động', href: '#cach-hoat-dong' },
    { label: 'Câu hỏi', href: '#faq' },
];

export default function LandingHeader() {
    return (
        <header className="flex justify-between items-center gap-4">
            <Link href="/" className="flex items-center gap-2.5">
                <span className="place-items-center grid bg-main rounded-lg size-10">
                    <Image src="/img/sub_logo.png" alt="" width={32} height={32} className="size-8" />
                </span>
                <span className="font-bold text-main text-xl tracking-tight">TOECO</span>
            </Link>

            <nav aria-label="Điều hướng landing" className="hidden md:block">
                <ul className="flex gap-6 font-medium text-subText text-sm">
                    {NAV.map(({ label, href }) => (
                        <li key={href}>
                            <a href={href} className="hover:text-main">
                                {label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="flex items-center gap-3">
                <Link href="/login" className={cn(buttonVariants({ variant: 'third', size: 'sm' }), 'hidden sm:inline-flex')}>
                    Đăng nhập
                </Link>
                <Link href="/overview" className={buttonVariants({ variant: 'primary', size: 'sm' })}>
                    Vào luyện tập
                </Link>
            </div>
        </header>
    );
}
