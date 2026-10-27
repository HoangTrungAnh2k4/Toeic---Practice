import type { Metadata } from 'next';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import FooterAssurance from './_components/footerAssurance';
import OverviewProgress from './_components/overviewProgress';
import RecentAttempt from './_components/_recentAttempt/recentAttempt';
import WelcomeBanner from './_components/welcome';

export const metadata: Metadata = {
    title: 'Tổng quan | Toeco',
    description: 'Tiến độ, điểm gần nhất và mục tiêu luyện TOEIC Speaking & Writing của bạn.',
};

export default async function Overview() {
    const exams = await getExamSummaries();

    return (
        <div className="flex flex-col gap-10 mx-auto w-full max-w-360">
            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Skill goals + progress chart */}
            <OverviewProgress exams={exams} />

            {/* Recent attempts */}
            <RecentAttempt exams={exams} />

            {/* Footer assurance card */}
            <FooterAssurance />
        </div>
    );
}
