import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, SidebarFallback } from '@/components/layout/sidebar';
import { SiteFooter } from '@/components/layout/footer/site-footer';
import { HideOnExam } from '@/components/layout/footer/hide-on-exam';
import { HideOnAuth } from '@/components/layout/hide-on-auth';
import { SITE_URL } from '@/lib/site';
import { Analytics } from '@vercel/analytics/next';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    variable: '--font-roboto',
    subsets: ['latin', 'vietnamese'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

const DESCRIPTION =
    'Luyện TOEIC Speaking & Writing sát format ETS: phòng thi có ghi âm, chấm điểm bằng AI theo rubric và nhận xét ngay sau khi nộp.';

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: 'Toeco',
    description: DESCRIPTION,
    icons: {
        icon: '/favicon.ico',
    },
    openGraph: { type: 'website', siteName: 'Toeco', locale: 'vi_VN', description: DESCRIPTION },
    twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="vi" data-scroll-behavior="smooth">
            <body
                className={`${roboto.variable} ${geistMono.variable} group/app antialiased min-h-screen flex flex-col`}
            >
                {/* Footer nằm ngoài khối này để sidebar sticky dừng ở đáy nội dung, không trượt đè lên footer */}
                <div className="flex md:flex-row flex-col flex-1 has-[.sidebar-root]:bg-main">
                    {/* usePathname cần Suspense trên các route có param động (cacheComponents) */}
                    <Suspense fallback={<SidebarFallback />}>
                        <HideOnAuth>
                            <Sidebar />
                        </HideOnAuth>
                    </Suspense>
                    {/* Không bọc children trong Suspense: fallback → nội dung thật sẽ remount trang và chạy lại animation */}
                    <div className="flex-1 bg-canvas px-4 sm:px-8 py-4 md:group-has-[.sidebar-root]/app:rounded-bl-3xl min-w-0 min-h-screen">
                        {children}
                    </div>
                </div>
                <Suspense>
                    <HideOnAuth>
                        <HideOnExam>
                            {/* Lề trái bằng độ rộng sidebar (w-64 / w-20 khi thu gọn) để nội dung footer thẳng hàng với nội dung trang */}
                            <div className="bg-main md:group-has-[.sidebar-root[data-collapsed=false]]/app:pl-64 md:group-has-[.sidebar-root[data-collapsed=true]]/app:pl-20 motion-safe:transition-[padding] duration-500 ease-[cubic-bezier(0.65,0,0.35,1)]">
                                <SiteFooter />
                            </div>
                        </HideOnExam>
                    </HideOnAuth>
                </Suspense>
            </body>
        </html>
    );
}
