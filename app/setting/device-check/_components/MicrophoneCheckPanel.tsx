'use client';

import { useId } from 'react';
import { LuChevronDown, LuMic } from 'react-icons/lu';
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

    return (
        <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
                <label htmlFor={selectId} className="font-semibold text-subText text-xs uppercase tracking-wider">
                    Thiết bị thu âm
                </label>
                <div className="relative">
                    <LuMic
                        className="top-1/2 left-3 absolute size-4 text-sub2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                    />
                    <select
                        id={selectId}
                        value={selectedId}
                        onChange={(event) => onSelectDevice(event.target.value)}
                        disabled={devices.length === 0}
                        className="bg-white disabled:opacity-100 pr-10 pl-9 border border-sub2/40 focus:border-main rounded-lg w-full h-10 font-medium text-main text-sm truncate transition-colors appearance-none cursor-pointer disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-sub3/60"
                    >
                        {devices.length === 0 ? (
                            <option value="">Micro mặc định của hệ thống</option>
                        ) : (
                            devices.map((device) => (
                                <option key={device.id} value={device.id}>
                                    {device.label}
                                </option>
                            ))
                        )}
                    </select>
                    <LuChevronDown
                        className="top-1/2 right-3 absolute size-4 text-sub2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                    />
                </div>
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
