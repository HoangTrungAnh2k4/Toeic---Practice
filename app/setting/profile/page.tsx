import type { Metadata } from 'next';
import ProfileGoalCard from './_components/ProfileGoalCard';
import ProfileHeader from './_components/ProfileHeader';
import ProfileIdentityCard from './_components/ProfileIdentityCard';
import { CURRENT_USER, GOAL_FIELDS, STUDY_FIELDS } from './utils';

export const metadata: Metadata = {
    title: 'Hồ sơ cá nhân | Toeco',
};

export default function ProfilePage() {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <ProfileHeader />

            <div className="items-start gap-6 grid grid-cols-1 lg:grid-cols-12">
                <ProfileIdentityCard user={CURRENT_USER} fields={STUDY_FIELDS} className="lg:col-span-4" />
                <ProfileGoalCard fields={GOAL_FIELDS} className="lg:col-span-8" />
            </div>
        </main>
    );
}
