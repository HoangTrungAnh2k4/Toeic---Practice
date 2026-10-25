'use client';

import { useId } from 'react';
import { LuMic } from 'react-icons/lu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AudioInputDevice, CheckStatus, MicStatus } from '../types';
import { SPEAKING_SAMPLE } from '../utils';
import CheckNotice from './CheckNotice';
import LevelMeter from './LevelMeter';
import MicrophoneAccessNotice from './MicrophoneAccessNotice';

interface MicrophoneCheckPanelProps {
    status: MicStatus;
    hasAccess: boolean;
    devices: AudioInputDevice[];
    deviceId: string;
    analyser: AnalyserNode | null;
    result: CheckStatus;
    onRequestAccess: () => void;
    onSelectDevice: (deviceId: string) => void;
    onSpeechDetected: () => void;
}

export default function MicrophoneCheckPanel({
    status,
    hasAccess,
    devices,
    deviceId,
    analyser,
    result,
    onRequestAccess,
    onSelectDevice,
    onSpeechDetected,
}: MicrophoneCheckPanelProps) {
    const selectId = useId();

    if (status !== 'active' || !analyser) {
        return <MicrophoneAccessNotice status={status} hasAccess={hasAccess} onRequestAccess={onRequestAccess} />;
    }

    const selectedId = devices.some((device) => device.id === deviceId) ? deviceId : (devices[0]?.id ?? '');
    const items =
        devices.length === 0
            ? [{ value: '', label: 'Micro mặc định của hệ thống' }]
            : devices.map((device) => ({ value: device.id, label: device.label }));

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <label htmlFor={selectId} className="font-semibold text-subText text-xs uppercase tracking-wider">
                    Thiết bị thu âm
                </label>
                <Select
                    items={items}
                    value={selectedId}
                    onValueChange={(next) => onSelectDevice(next as string)}
                    disabled={devices.length === 0}
                >
                    <SelectTrigger
                        id={selectId}
                        className="bg-white disabled:opacity-100 px-3 border-sub2/40 focus-visible:border-main focus-visible:ring-2 focus-visible:ring-sub3/60 w-full data-[size=default]:h-10 font-medium text-main text-sm cursor-pointer disabled:cursor-default"
                    >
                        <LuMic className="size-4 text-sub2" aria-hidden="true" />
                        <SelectValue className="truncate" />
                    </SelectTrigger>
                    <SelectContent>
                        {items.map((item) => (
                            <SelectItem key={item.value} value={item.value}>
                                {item.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <p className="text-subText text-xs">
                    Nên dùng tai nghe có micro (headset) để giọng nói rõ và ít lẫn tạp âm.
                </p>
            </div>

            <LevelMeter analyser={analyser} onSpeech={onSpeechDetected} />

            <div role="status" aria-live="polite">
                {result === 'passed' ? (
                    <CheckNotice tone="success" title="Micro hoạt động tốt">
                        Đã nhận được giọng nói rõ ràng. Bấm Tiếp tục để ghi âm thử và nghe lại.
                    </CheckNotice>
                ) : (
                    <CheckNotice tone="info" title="Đọc to câu sau với giọng bình thường">
                        <span lang="en" className="block my-1 font-semibold text-main text-sm italic">
                            “{SPEAKING_SAMPLE}”
                        </span>
                        Micro được xác nhận khi thang đo chạm vùng <strong className="text-main">Lý tưởng</strong>{' '}
                        trong vài giây.
                    </CheckNotice>
                )}
            </div>
        </div>
    );
}
