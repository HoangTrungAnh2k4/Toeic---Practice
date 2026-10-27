import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import BackToTop from '../components/landing/BackToTop';
import ScrollReveal from '../components/landing/ScrollReveal';
import LandingEtsFormat from '../components/landing/LandingEtsFormat';
import LandingFaq from '../components/landing/LandingFaq';
import LandingHeader from '../components/landing/LandingHeader';
import LandingHero from '../components/landing/LandingHero';
import LandingMistakes from '../components/landing/LandingMistakes';
import { LandingSchedule } from '../components/landing/LandingSchedule';
import { SiteFooter } from '@/components/layout/footer/site-footer';
import { MISTAKES_ENABLED } from '@/app/mistakes/utils';

// Font viết tay chỉ dùng ở landing (chú thích, chữ sửa lỗi)
const patrickHand = Patrick_Hand({ weight: '400', variable: '--font-patrick-hand', subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
    title: 'Toeco - Luyện TOEIC Speaking & Writing',
};

/** Landing page: giới thiệu tính năng và dẫn người dùng vào luyện tập. */
export default function LandingPage() {
    return (
        // Margin âm triệt padding ngang của khung root (app/layout.tsx); không dùng :has() vì cacheComponents giữ route ẩn trong DOM
        <div className={`${patrickHand.variable} flex flex-col -mb-5 -mx-4 sm:-mx-8`}>
            <LandingHeader />
            <main className="flex flex-col items-center">
                <LandingHero />
                {MISTAKES_ENABLED && <LandingMistakes />}
                <LandingSchedule />
                <LandingEtsFormat />
                <LandingFaq />
            </main>
            <SiteFooter />
            <BackToTop />
            <ScrollReveal />
        </div>
    );
}
