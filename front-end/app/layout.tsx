import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, SidebarFallback } from '@/components/layout/sidebar';
import { SiteFooter } from '@/components/layout/footer/site-footer';
import { HideOnExam } from '@/components/layout/footer/hide-on-exam';
import { HideOnAuth } from '@/components/layout/hide-on-auth';
import { SITE_URL } from '@/lib/site';

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
        <html lang="vi">
            <body className={`${roboto.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col md:flex-row`}>
                {/* usePathname cần Suspense trên các route có param động (cacheComponents) */}
                <Suspense fallback={<SidebarFallback />}>
                    <HideOnAuth>
                        <Sidebar />
                    </HideOnAuth>
                </Suspense>
                <div className="flex flex-col flex-1 bg-canvas min-w-0">
                    {/* Không bọc children trong Suspense: fallback → nội dung thật sẽ remount trang và chạy lại animation */}
                    <div className="flex-1 px-4 sm:px-8 pt-4 min-h-screen">{children}</div>
                    <Suspense>
                        <HideOnAuth>
                            <HideOnExam>
                                <SiteFooter />
                            </HideOnExam>
                        </HideOnAuth>
                    </Suspense>
                </div>
            </body>
        </html>
    );
}
