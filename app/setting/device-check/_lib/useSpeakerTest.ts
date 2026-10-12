'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { EarSide } from '../types';
import { CHIME_FREQUENCIES, CHIME_NOTE_GAP_S, CHIME_NOTE_S, CHIME_SIDE_S, CHIME_VOLUME, EAR_SIDES } from '../utils';

/** Phát tiếng chuông thử lần lượt ở tai trái rồi tai phải bằng Web Audio. */
export function useSpeakerTest() {
    const [playingSide, setPlayingSide] = useState<EarSide | null>(null);
    const [hasPlayed, setHasPlayed] = useState(false);
    const [isUnsupported, setIsUnsupported] = useState(false);
    const contextRef = useRef<AudioContext | null>(null);
    const timersRef = useRef<number[]>([]);

    const release = useCallback(() => {
        timersRef.current.forEach((timer) => window.clearTimeout(timer));
        timersRef.current = [];
        void contextRef.current?.close();
        contextRef.current = null;
    }, []);

    const stop = useCallback(() => {
        release();
        setPlayingSide(null);
    }, [release]);

    const play = useCallback(() => {
        release();
        if (typeof AudioContext === 'undefined') {
            setIsUnsupported(true);
            return;
        }

        const context = new AudioContext();
        contextRef.current = context;
        const startAt = context.currentTime + 0.05;

        EAR_SIDES.forEach((side, sideIndex) => {
            const sideStart = startAt + sideIndex * CHIME_SIDE_S;
            const panner = new StereoPannerNode(context, { pan: side === 'left' ? -1 : 1 });
            panner.connect(context.destination);

            CHIME_FREQUENCIES.forEach((frequency, noteIndex) => {
                const noteStart = sideStart + noteIndex * CHIME_NOTE_GAP_S;
                const oscillator = new OscillatorNode(context, { type: 'sine', frequency });
                const envelope = new GainNode(context, { gain: 0 });
                envelope.gain.setValueAtTime(0, noteStart);
                envelope.gain.linearRampToValueAtTime(CHIME_VOLUME, noteStart + 0.02);
                envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + CHIME_NOTE_S);
                oscillator.connect(envelope).connect(panner);
                oscillator.start(noteStart);
                oscillator.stop(noteStart + CHIME_NOTE_S);
            });

            if (sideIndex > 0) {
                timersRef.current.push(window.setTimeout(() => setPlayingSide(side), sideIndex * CHIME_SIDE_S * 1000));
            }
        });

        timersRef.current.push(
            window.setTimeout(() => {
                stop();
                setHasPlayed(true);
            }, EAR_SIDES.length * CHIME_SIDE_S * 1000),
        );
        setPlayingSide(EAR_SIDES[0]);
    }, [release, stop]);

    useEffect(() => release, [release]);

    return { playingSide, hasPlayed, isUnsupported, play, stop };
}
