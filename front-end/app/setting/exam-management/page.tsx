import type { Metadata } from 'next';
import ExamLibraryLoader from './_components/ExamLibraryLoader';
import ExamManagementHeader from './_components/ExamManagementHeader';

export const metadata: Metadata = {
    title: 'Quản lý đề | Toeco',
};

export default function ExamManagementPage() {
    return (
        <main className="flex flex-col gap-8 mx-auto w-full min-w-0 max-w-360">
            <ExamManagementHeader />
            <ExamLibraryLoader />
        </main>
    );
}
