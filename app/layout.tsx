import type { Metadata } from 'next';
import { Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';
import { SiteFooter } from '@/components/layout/footer/site-footer';
import { HideOnExam } from '@/components/layout/footer/hide-on-exam';

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
            <body className={`${roboto.variable} ${geistMono.variable} antialiased min-h-screen flex`}>
                <Sidebar />
                <div className="flex flex-col flex-1 bg-[#eef0fc] min-w-0">
                    <div className="flex-1 px-4 sm:px-8 pt-4 pb-10">{children}</div>
                    <HideOnExam>
                        <SiteFooter />
                    </HideOnExam>
                </div>
            </body>
        </html>
    );
}
