import { GuestDataNotice } from '@/components/user/guest-data-notice';
import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import FooterAssurance from './_components/footerAssurance';
import OverviewProgress from './_components/overviewProgress';
import RecentAttempt from './_components/_recentAttempt/recentAttempt';
import WelcomeBanner from './_components/welcome';

export default async function Overview() {
    const [exams, patterns] = await Promise.all([getExamSummaries(), listMistakePatterns()]);

    return (
        <div className="flex flex-col gap-10 mx-auto w-full max-w-360">
            <GuestDataNotice />

            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Skill goals + progress chart */}
            <OverviewProgress exams={exams} patterns={patterns} />

            {/* Recent attempts */}
            <RecentAttempt exams={exams} />

            {/* Footer assurance card */}
            <FooterAssurance />
        </div>
    );
}
