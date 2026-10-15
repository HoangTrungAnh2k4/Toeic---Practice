import { listMistakePatterns } from '@/lib/data/mistake-patterns';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import ScheduleView from './_components/ScheduleView';

export default async function SchedulePage() {
    const [exams, patterns] = await Promise.all([getExamSummaries(), listMistakePatterns()]);

    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <ScheduleView exams={exams} patterns={patterns} />
        </main>
    );
}
