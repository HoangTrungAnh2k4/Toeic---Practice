import ExamLibrary from './_components/ExamLibrary';
import ExamManagementHeader from './_components/ExamManagementHeader';
import { getExamLibrary } from './_lib/data';

export default async function ExamManagementPage() {
    const exams = await getExamLibrary();

    return (
        <main className="flex flex-col gap-8 mx-auto w-full min-w-0 max-w-360">
            <ExamManagementHeader />
            <ExamLibrary initialExams={exams} />
        </main>
    );
}
