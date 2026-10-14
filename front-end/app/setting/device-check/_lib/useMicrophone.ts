'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AudioInputDevice, MicStatus } from '../types';
import { getMicIssue } from '../utils';

interface MicSession {
    stream: MediaStream;
    context: AudioContext;
}

interface MicInput {
    stream: MediaStream;
    analyser: AnalyserNode;
}

/** Quản lý quyền micro, danh sách thiết bị thu âm và luồng âm thanh kèm AnalyserNode để đo âm lượng. */
export function useMicrophone() {
    const [status, setStatus] = useState<MicStatus>('idle');
    const [devices, setDevices] = useState<AudioInputDevice[]>([]);
    const [deviceId, setDeviceId] = useState('');
    const [input, setInput] = useState<MicInput | null>(null);
    /** Người dùng đã cấp quyền thành công trong phiên này, dùng để tự bật lại micro khi quay về bước liên quan. */
    const [hasAccess, setHasAccess] = useState(false);
    const sessionRef = useRef<MicSession | null>(null);
    /** Tăng mỗi lần bật/tắt để bỏ qua các yêu cầu quyền đã lỗi thời. */
    const requestIdRef = useRef(0);

    const teardown = useCallback(() => {
        requestIdRef.current += 1;
        const session = sessionRef.current;
        sessionRef.current = null;
        session?.stream.getTracks().forEach((track) => track.stop());
        void session?.context.close();
    }, []);

    const refreshDevices = useCallback(async () => {
        try {
            const all = await navigator.mediaDevices.enumerateDevices();
            const inputs = all.filter((device) => device.kind === 'audioinput' && device.deviceId);
            setDevices(
                inputs.map((device, index) => ({ id: device.deviceId, label: device.label || `Micro ${index + 1}` })),
            );
        } catch {
            setDevices([]);
        }
    }, []);

    const start = useCallback(
        async (preferredId?: string) => {
            teardown();
            const requestId = requestIdRef.current;
            setInput(null);

            if (!navigator.mediaDevices?.getUserMedia || typeof AudioContext === 'undefined') {
                setStatus(window.isSecureContext ? 'unsupported' : 'insecure');
                return;
            }

            setStatus('requesting');
            // Tạo AudioContext ngay trong thao tác của người dùng để trình duyệt không tạm dừng nó.
            const context = new AudioContext();
            let stream: MediaStream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    audio: preferredId ? { deviceId: { ideal: preferredId } } : true,
                });
            } catch (error) {
                void context.close();
                if (requestId === requestIdRef.current) setStatus(getMicIssue(error));
                return;
            }

            if (requestId !== requestIdRef.current) {
                stream.getTracks().forEach((track) => track.stop());
                void context.close();
                return;
            }

            const analyser = new AnalyserNode(context, { fftSize: 2048 });
            context.createMediaStreamSource(stream).connect(analyser);
            void context.resume();
            sessionRef.current = { stream, context };

            const [track] = stream.getAudioTracks();
            track?.addEventListener('ended', () => {
                if (sessionRef.current?.stream !== stream) return;
                teardown();
                setInput(null);
                setStatus('disconnected');
            });

            setInput({ stream, analyser });
            setDeviceId(track?.getSettings().deviceId ?? preferredId ?? '');
            setHasAccess(true);
            setStatus('active');
            void refreshDevices();
        },
        [refreshDevices, teardown],
    );

    const stop = useCallback(() => {
        teardown();
        setInput(null);
        setStatus((current) => (current === 'active' || current === 'requesting' ? 'idle' : current));
    }, [teardown]);

    // Cập nhật danh sách khi người dùng cắm/rút thiết bị.
    useEffect(() => {
        const mediaDevices = navigator.mediaDevices;
        if (!hasAccess || !mediaDevices) return;
        const handleDeviceChange = () => void refreshDevices();
        mediaDevices.addEventListener('devicechange', handleDeviceChange);
        return () => mediaDevices.removeEventListener('devicechange', handleDeviceChange);
    }, [hasAccess, refreshDevices]);

    useEffect(() => teardown, [teardown]);

    return {
        status,
        devices,
        deviceId,
        stream: input?.stream ?? null,
        analyser: input?.analyser ?? null,
        hasAccess,
        start,
        stop,
    };
}
