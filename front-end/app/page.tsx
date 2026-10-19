import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';
import LandingMistakes from '../components/landing/LandingMistakes';
import { LandingSchedule } from '../components/landing/LandingSchedule';

// Font viết tay chỉ dùng ở landing (chú thích, chữ sửa lỗi)
const patrickHand = Patrick_Hand({ weight: '400', variable: '--font-patrick-hand', subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
    title: 'Toeco - Luyện TOEIC Speaking & Writing',
};

/** Landing page: giới thiệu tính năng và dẫn người dùng vào luyện tập. */
export default function Home() {
    return (
        <div data-landing className={`${patrickHand.variable} flex flex-col gap-20 pb-6 w-full`}>
            <LandingHeader />
            <main className="flex flex-col items-center">
                <LandingHero />
                <LandingMistakes />
                <LandingSchedule />
            </main>
        </div>
    );
}
