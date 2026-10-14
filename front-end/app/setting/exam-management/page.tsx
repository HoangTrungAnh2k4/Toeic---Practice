import ExamLibrary from './_components/ExamLibrary';
import ImportStudio from './_components/ImportStudio';
import ExamManagementHeader from './_components/ExamManagementHeader';

export default function ExamManagementPage() {
    return (
        <main className="flex flex-col gap-8 mx-auto w-full min-w-0 max-w-360">
            <ExamManagementHeader />
            <ImportStudio />
            <ExamLibrary />
        </main>
    );
}
