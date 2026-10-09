import NoticeBanner from './_components/noticeBanner';
import WelcomeBanner from './_components/welcome';
import HeroBanner from './_components/heroBanner';
import SkillGoals_Chart from './_components/skillGoals_+_Chart';
import PriorityError from './_components/priorityError';
import RecentAttempt from './_components/recentAttempt';
import FooterAssurance from './_components/footerAssurance';

export default function Dashboard() {
    return (
        <div className="flex flex-col gap-8 mx-auto w-full max-w-360">
            {/* Offline / local cache notice */}
            {/* <NoticeBanner /> */}

            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Hero: next task */}
            <HeroBanner />

            {/* Skill goals + progress chart */}
            <SkillGoals_Chart />

            {/* Priority errors */}
            <PriorityError />

            {/* Recent attempts */}
            <RecentAttempt />

            {/* Footer assurance card */}
            <FooterAssurance />
        </div>
    );
}
