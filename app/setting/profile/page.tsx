import type { Metadata } from 'next';
import { LuAlarmClock, LuBookOpenCheck, LuClock, LuFlame, LuListChecks, LuSunMoon } from 'react-icons/lu';
import { getMistakeSummary } from '@/app/mistakes/_lib/data';
import { CURRENT_WEEK, EXAM_GOAL, MONTHLY_PROGRESS, SKILL_PROGRESS } from '@/app/schedule/utils';
import PartScoreCard from './_components/PartScoreCard';
import ProfileGoalCard from './_components/ProfileGoalCard';
import ProfileIdentityCard from './_components/ProfileIdentityCard';
import ProfileMistakesCard from './_components/ProfileMistakesCard';
import StudyHabitCard from './_components/StudyHabitCard';
import { ProfileField } from './types';
import {
    COMPLETED_EXERCISES,
    CURRENT_USER,
    formatDuration,
    getDaysUntil,
    MONTHLY_STUDY_MINUTES,
    PART_SCORES,
    RECENT_STUDY_DAYS,
    SCORE_HISTORY,
    STUDY_PREFERENCE,
} from './utils';

export const metadata: Metadata = {
    title: 'Hồ sơ cá nhân | Toeco',
};

export default async function ProfilePage() {
    const mistakeSummary = await getMistakeSummary();
    const studyTime = formatDuration(MONTHLY_STUDY_MINUTES);
    const sessionCount = MONTHLY_PROGRESS.completed;
    const { speaking, writing } = COMPLETED_EXERCISES;
    const { resolved, active, improving } = mistakeSummary.byStatus;

    const habitFields: ProfileField[] = [
        {
            id: 'schedule',
            label: 'Lịch học',
            value: `${EXAM_GOAL.minutesPerDay} phút · ${EXAM_GOAL.daysPerWeek} ngày/tuần`,
            Icon: LuClock,
        },
        { id: 'time', label: 'Giờ học quen thuộc', value: STUDY_PREFERENCE.preferredTime, Icon: LuSunMoon },
        { id: 'reminder', label: 'Nhắc học', value: STUDY_PREFERENCE.reminder, Icon: LuAlarmClock },
    ];

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <ProfileIdentityCard
                user={CURRENT_USER}
                weekIndex={CURRENT_WEEK.index}
                examDate={EXAM_GOAL.examDate}
                daysLeft={getDaysUntil(EXAM_GOAL.examDate)}
                sessions={MONTHLY_PROGRESS}
            />

            <div className="items-stretch gap-6 grid grid-cols-1 xl:grid-cols-3">
                <ProfileGoalCard skills={SKILL_PROGRESS} history={SCORE_HISTORY} className="xl:col-span-2" />
                <StudyHabitCard days={RECENT_STUDY_DAYS} goalMinutes={EXAM_GOAL.minutesPerDay} fields={habitFields} />
            </div>

            <div className="items-stretch gap-6 grid grid-cols-1 xl:grid-cols-3">
                <PartScoreCard scores={PART_SCORES} className="xl:col-span-2" />
                <ProfileMistakesCard />
            </div>
        </main>
    );
}
