import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar, SidebarFallback } from '@/components/layout/sidebar';
import { SiteFooter } from '@/components/layout/footer/site-footer';
import { HideOnExam } from '@/components/layout/footer/hide-on-exam';
import { HideOnAuth } from '@/components/layout/hide-on-auth';

const roboto = Roboto({
    weight: ['300', '400', '500', '700'],
    variable: '--font-roboto',
    subsets: ['latin', 'vietnamese'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Toeco',
    description: 'Practice TOEIC anytime, anywhere',
    icons: {
        icon: '/favicon.ico',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className={`${roboto.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col md:flex-row`}>
                {/* usePathname cần Suspense trên các route có param động (cacheComponents) */}
                <Suspense fallback={<SidebarFallback />}>
                    <HideOnAuth>
                        <Sidebar />
                    </HideOnAuth>
                </Suspense>
                <div className="flex flex-col flex-1 bg-canvas min-w-0">
                    {/* Không bọc children trong Suspense: fallback → nội dung thật sẽ remount trang và chạy lại animation */}
                    <div className="flex-1 has-data-[slot=auth-shell]:p-0 px-4 sm:px-8 pt-4 pb-10">{children}</div>
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
