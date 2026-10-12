import SettingPageHeader from './_components/SettingPageHeader';
import SettingSectionCard from './_components/SettingSectionCard';
import { SETTING_SECTIONS } from './utils';

export default function SettingPage() {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <SettingPageHeader />

            <section aria-labelledby="setting-sections-title" className="flex flex-col gap-4">
                <div className="flex justify-between items-end gap-3">
                    <h2 id="setting-sections-title" className="font-bold text-main text-lg">
                        Danh mục cài đặt
                    </h2>
                    <span className="font-medium text-subText text-xs">{SETTING_SECTIONS.length} mục</span>
                </div>

                <div className="gap-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                    {SETTING_SECTIONS.map((section) => (
                        <SettingSectionCard key={section.id} section={section} />
                    ))}
                </div>
            </section>
        </main>
    );
}
