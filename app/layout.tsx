import type { Metadata } from 'next';
import { Roboto, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/sidebar';

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
                <div className="flex-1 bg-[#eef0fc] px-8 pt-4 pb-6">{children}</div>
            </body>
        </html>
    );
}
