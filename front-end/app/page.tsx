import type { Metadata } from 'next';
import { Patrick_Hand } from 'next/font/google';
import LandingHeader from './_components/LandingHeader';
import LandingHero from './_components/LandingHero';
import LandingMistakes from './_components/LandingMistakes';
import LandingSchedule from './_components/LandingSchedule';
import LandingFeatures from './_components/LandingFeatures';
import LandingHowItWorks from './_components/LandingHowItWorks';
import LandingFaq from './_components/LandingFaq';
import LandingCta from './_components/LandingCta';

// Font viết tay chỉ dùng ở landing (chú thích, chữ sửa lỗi)
const patrickHand = Patrick_Hand({ weight: '400', variable: '--font-patrick-hand', subsets: ['latin', 'vietnamese'] });

export const metadata: Metadata = {
    title: 'Toeco - Luyện TOEIC Speaking & Writing',
};

/** Landing page: giới thiệu tính năng và dẫn người dùng vào luyện tập. */
export default function Home() {
    return (
        <div className={`${patrickHand.variable} flex flex-col gap-20 mx-auto pb-6 w-full max-w-6xl`}>
            <LandingHeader />
            <main className="flex flex-col gap-20">
                <LandingHero />
                <LandingMistakes />
                <LandingSchedule />
                <LandingFeatures />
                <LandingHowItWorks />
                <LandingFaq />
                <LandingCta />
            </main>
        </div>
    );
}
