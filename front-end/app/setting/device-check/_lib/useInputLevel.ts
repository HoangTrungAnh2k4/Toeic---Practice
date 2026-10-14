'use client';

import { useEffect, useEffectEvent, useState } from 'react';
import { METER_MIN_DB, METER_RELEASE_DB_PER_SECOND, readLevelDb, SPEECH_CONFIRM_MS, SPEECH_MIN_DB } from '../utils';

/**
 * Theo dõi mức âm lượng micro (dBFS) theo từng khung hình: lên nhanh, hạ chậm để dễ quan sát.
 * `onSpeech` được gọi một lần khi tổng thời gian nói rõ đạt SPEECH_CONFIRM_MS.
 */
export function useInputLevel(analyser: AnalyserNode | null, onSpeech?: () => void): number {
    const [level, setLevel] = useState(METER_MIN_DB);
    const notifySpeech = useEffectEvent(() => onSpeech?.());

    useEffect(() => {
        if (!analyser) return;
        const samples = new Float32Array(analyser.fftSize);
        let frameId = 0;
        let lastTime = performance.now();
        let displayed = METER_MIN_DB;
        let speechMs = 0;
        let hasNotified = false;

        const tick = (now: number) => {
            const elapsed = Math.max(0, now - lastTime);
            lastTime = now;
            const current = readLevelDb(analyser, samples);
            displayed = Math.max(current, displayed - (METER_RELEASE_DB_PER_SECOND * elapsed) / 1000);

            if (current >= SPEECH_MIN_DB) speechMs += elapsed;
            if (!hasNotified && speechMs >= SPEECH_CONFIRM_MS) {
                hasNotified = true;
                notifySpeech();
            }

            setLevel(Math.round(displayed));
            frameId = requestAnimationFrame(tick);
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [analyser]);

    return analyser ? level : METER_MIN_DB;
}
