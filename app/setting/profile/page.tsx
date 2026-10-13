import type { Metadata } from 'next';
import { LuAlarmClock, LuBookOpenCheck, LuClock, LuFlame, LuListChecks, LuSunMoon } from 'react-icons/lu';
import { getMistakeSummary } from '@/app/mistakes/_lib/data';
import { CURRENT_WEEK, EXAM_GOAL, MONTHLY_PROGRESS, SKILL_PROGRESS } from '@/app/schedule/utils';
import PartScoreCard from './_components/PartScoreCard';
import ProfileGoalCard from './_components/ProfileGoalCard';
import ProfileHeader from './_components/ProfileHeader';
import ProfileIdentityCard from './_components/ProfileIdentityCard';
import ProfileMistakesCard from './_components/ProfileMistakesCard';
import ProfileStatGrid from './_components/ProfileStatGrid';
import StudyHabitCard from './_components/StudyHabitCard';
import { ProfileField, ProfileStat } from './types';
import {
    ACCOUNT_FIELDS,
    BEST_STREAK_DAYS,
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

    const stats: ProfileStat[] = [
        {
            id: 'streak',
            label: 'Chuỗi ngày học',
            value: String(EXAM_GOAL.streakDays),
            unit: 'ngày',
            hint: `Kỷ lục của bạn: ${BEST_STREAK_DAYS} ngày`,
            Icon: LuFlame,
        },
        {
            id: 'time',
            label: 'Thời gian luyện tháng này',
            value: studyTime.value,
            unit: studyTime.unit,
            hint: `Trung bình ${Math.round(MONTHLY_STUDY_MINUTES / Math.max(1, sessionCount))} phút mỗi buổi`,
            Icon: LuClock,
        },
        {
            id: 'exercises',
            label: 'Bài đã hoàn thành',
            value: String(speaking + writing),
            unit: 'bài',
            hint: `Speaking ${speaking} · Writing ${writing}`,
            Icon: LuListChecks,
        },
        {
            id: 'mistakes',
            label: 'Lỗi đã khắc phục',
            value: String(resolved),
            unit: `/ ${mistakeSummary.total} lỗi`,
            hint: `${active + improving} lỗi đang được theo dõi`,
            Icon: LuBookOpenCheck,
        },
    ];

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
            <ProfileHeader />

            <ProfileIdentityCard
                user={CURRENT_USER}
                weekIndex={CURRENT_WEEK.index}
                examDate={EXAM_GOAL.examDate}
                daysLeft={getDaysUntil(EXAM_GOAL.examDate)}
                sessions={MONTHLY_PROGRESS}
            />

            <ProfileStatGrid stats={stats} />

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
