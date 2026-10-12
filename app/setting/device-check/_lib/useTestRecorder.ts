'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { RecorderStatus } from '../types';
import { readLevelDb, RECORD_MS, WAVEFORM_BARS } from '../utils';

/** Mỗi cột sóng âm ứng với một khoảng thời gian bằng nhau của đoạn ghi. */
const SAMPLE_INTERVAL_MS = RECORD_MS / WAVEFORM_BARS;

/** Ghi âm thử tối đa RECORD_MS và lấy mẫu âm lượng để vẽ sóng âm của chính đoạn vừa thu. */
export function useTestRecorder(stream: MediaStream | null, analyser: AnalyserNode | null) {
    const [status, setStatus] = useState<RecorderStatus>('idle');
    const [elapsedMs, setElapsedMs] = useState(0);
    const [waveform, setWaveform] = useState<number[]>([]);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const timerRef = useRef<number | undefined>(undefined);
    const audioUrlRef = useRef<string | null>(null);

    const clearTimer = useCallback(() => {
        window.clearInterval(timerRef.current);
        timerRef.current = undefined;
    }, []);

    /** Hủy lượt ghi đang chạy (nếu có) và giải phóng đoạn ghi trước đó. */
    const discard = useCallback(() => {
        clearTimer();
        const recorder = recorderRef.current;
        // Bỏ tham chiếu trước khi dừng để sự kiện `stop` không lưu lượt ghi bị hủy.
        recorderRef.current = null;
        if (recorder && recorder.state !== 'inactive') recorder.stop();
        if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
    }, [clearTimer]);

    /** Kết thúc lượt ghi hiện tại và giữ lại đoạn đã thu. */
    const finish = useCallback(() => {
        clearTimer();
        const recorder = recorderRef.current;
        if (recorder && recorder.state !== 'inactive') recorder.stop();
    }, [clearTimer]);

    const start = useCallback(() => {
        if (!stream || !analyser) return;
        discard();
        setAudioUrl(null);
        setWaveform([]);
        setElapsedMs(0);

        let recorder: MediaRecorder;
        try {
            recorder = new MediaRecorder(stream);
            recorder.start();
        } catch {
            setStatus('error');
            return;
        }

        const chunks: Blob[] = [];
        const samples = new Float32Array(analyser.fftSize);
        const startedAt = performance.now();

        // Sự kiện của MediaRecorder được phát bất đồng bộ nên có thể gắn ngay sau start().
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) chunks.push(event.data);
        };
        recorder.onstop = () => {
            if (recorderRef.current !== recorder) return;
            recorderRef.current = null;
            clearTimer();
            setElapsedMs(Math.min(RECORD_MS, performance.now() - startedAt));

            const blob = new Blob(chunks, { type: recorder.mimeType });
            if (!blob.size) {
                setStatus('error');
                return;
            }
            const url = URL.createObjectURL(blob);
            audioUrlRef.current = url;
            setAudioUrl(url);
            setStatus('recorded');
        };
        recorder.onerror = () => {
            discard();
            setStatus('error');
        };

        recorderRef.current = recorder;
        setStatus('recording');

        timerRef.current = window.setInterval(() => {
            const elapsed = performance.now() - startedAt;
            const level = readLevelDb(analyser, samples);
            // Số cột tính theo thời gian đã ghi nên nhịp interval bị trễ vẫn lấp đủ sóng âm.
            const barCount = Math.min(WAVEFORM_BARS, Math.round(elapsed / SAMPLE_INTERVAL_MS));
            setWaveform((bars) =>
                bars.length < barCount ? [...bars, ...Array<number>(barCount - bars.length).fill(level)] : bars,
            );
            setElapsedMs(Math.min(RECORD_MS, elapsed));
            if (elapsed >= RECORD_MS) finish();
        }, SAMPLE_INTERVAL_MS);
    }, [analyser, clearTimer, discard, finish, stream]);

    useEffect(() => discard, [discard]);

    return { status, elapsedMs, waveform, audioUrl, start, stop: finish };
}
