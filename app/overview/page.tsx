import WelcomeBanner from './_components/welcome';
import PriorityError from './_components/_priorityError/priorityError';
import RecentAttempt from './_components/_recentAttempt/recentAttempt';
import FooterAssurance from './_components/footerAssurance';
import SkillGoals from './_components/skillGoal';
import { Chart } from './_components/chart';

export default function Overview() {
    return (
        <div className="flex flex-col gap-10 mx-auto w-full max-w-360">
            {/* Offline / local cache notice */}
            {/* <NoticeBanner /> */}

            {/* Welcome banner */}
            <WelcomeBanner />

            {/* Skill goals + progress chart */}
            <div className="flex gap-2">
                <SkillGoals />
                <Chart />
            </div>

            {/* Priority errors */}
            <PriorityError />

            {/* Recent attempts */}
            <RecentAttempt />

            {/* Footer assurance card */}
            <FooterAssurance />
        </div>
    );
}
