import ExamLibrary from './_components/ExamLibrary';
import ImportStudio from './_components/ImportStudio';
import SettingPageHeader from './_components/SettingPageHeader';

export default function SettingPage() {
    return (
        <main className="flex flex-col gap-8 mx-auto w-full min-w-0 max-w-360">
            <SettingPageHeader />
            <ImportStudio />
            <ExamLibrary />
        </main>
    );
}
