import type { Metadata } from 'next';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import ProfileView from './_components/ProfileView';

export const metadata: Metadata = {
    title: 'Hồ sơ cá nhân | Toeco',
};

export default async function ProfilePage() {
    const exams = await getExamSummaries();

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <ProfileView exams={exams} />
        </main>
    );
}
