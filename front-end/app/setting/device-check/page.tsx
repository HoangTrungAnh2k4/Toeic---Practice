import type { Metadata } from 'next';
import DeviceCheckHeader from './_components/DeviceCheckHeader';
import DeviceCheckWizard from './_components/DeviceCheckWizard';

export const metadata: Metadata = {
    title: 'Kiểm tra thiết bị | Toeco',
};

export default function DeviceCheckPage() {
    return (
        <main className="flex flex-col gap-6 mx-auto w-full min-w-0 max-w-360">
            <DeviceCheckHeader />
            <DeviceCheckWizard />
        </main>
    );
}
