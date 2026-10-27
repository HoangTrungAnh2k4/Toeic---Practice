import type { Metadata } from 'next';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import ScheduleView from './_components/ScheduleView';

export const metadata: Metadata = {
    title: 'Lộ trình học | Toeco',
    description: 'Lịch luyện TOEIC Speaking & Writing theo tuần, bám mục tiêu điểm và ngày thi.',
};

export default async function SchedulePage() {
    const exams = await getExamSummaries();

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <ScheduleView exams={exams} />
        </main>
    );
}
