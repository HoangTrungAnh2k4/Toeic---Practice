import type { Metadata } from 'next';
import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import ScheduleView from './_components/ScheduleView';

export const metadata: Metadata = {
    title: 'Lộ trình học | Toeco',
    description: 'Lịch luyện TOEIC Speaking & Writing theo tuần, bám mục tiêu điểm và ngày thi.',
};

export default async function SchedulePage() {
    const [exams, patterns] = await Promise.all([getExamSummaries(), listMistakePatterns()]);

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <ScheduleView exams={exams} patterns={patterns} />
        </main>
    );
}
