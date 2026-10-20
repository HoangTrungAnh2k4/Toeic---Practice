import type { Metadata } from 'next';
import SettingGroupSection from './_components/SettingGroupSection';
import { SETTING_GROUPS } from './utils';

export const metadata: Metadata = {
    title: 'Cài đặt | Toeco',
};

export default function SettingPage() {
    return (
        <main className="flex flex-col gap-8 mx-auto w-full min-w-0 max-w-360">
            {SETTING_GROUPS.map((group) => (
                <SettingGroupSection key={group.id} group={group} />
            ))}
        </main>
    );
}
