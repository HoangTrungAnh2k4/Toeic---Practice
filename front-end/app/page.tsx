import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import BackToTop from '../components/landing/BackToTop';
import LandingEtsFormat from '../components/landing/LandingEtsFormat';
import LandingFaq from '../components/landing/LandingFaq';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';
import LandingMistakes from '../components/landing/LandingMistakes';
import { LandingSchedule } from '../components/landing/LandingSchedule';
import { SiteFooter } from '@/components/layout/footer/site-footer';

// Font viết tay chỉ dùng ở landing (chú thích, chữ sửa lỗi)
const patrickHand = Patrick_Hand({ weight: '400', variable: '--font-patrick-hand', subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
    title: 'Toeco - Luyện TOEIC Speaking & Writing',
};

/** Landing page: giới thiệu tính năng và dẫn người dùng vào luyện tập. */
export default function LandingPage() {
    return (
        <div data-landing className={`${patrickHand.variable} flex flex-col    w-full`}>
            <LandingHeader />
            <main className="flex flex-col items-center">
                <LandingHero />
                <LandingMistakes />
                <LandingSchedule />
                <LandingEtsFormat />
                <LandingFaq />
            </main>
            <SiteFooter />
            <BackToTop />
        </div>
    );
}
