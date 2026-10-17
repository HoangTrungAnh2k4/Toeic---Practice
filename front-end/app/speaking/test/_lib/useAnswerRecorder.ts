'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Recording {
    recorder: MediaRecorder;
    chunks: Blob[];
}

export type AnswerRecorderStatus = 'idle' | 'recording' | 'error';

/**
 * Ghi âm câu trả lời: mỗi lượt `start` → `stop` cho ra một Blob.
 * Không dùng `useTestRecorder` vì hook đó huỷ bản ghi cũ khi `start` lại, chuyển câu nhanh sẽ mất bài nói câu trước.
 */
export function useAnswerRecorder(stream: MediaStream | null) {
    const [status, setStatus] = useState<AnswerRecorderStatus>('idle');
    const recordingRef = useRef<Recording | null>(null);

    /** Chốt lượt ghi hiện tại; `null` khi không có lượt nào đang ghi hoặc bản ghi rỗng. */
    const stop = useCallback((): Promise<Blob | null> => {
        const recording = recordingRef.current;
        recordingRef.current = null;
        if (!recording || recording.recorder.state === 'inactive') return Promise.resolve(null);

        const { recorder, chunks } = recording;
        setStatus('idle');
        return new Promise((resolve) => {
            // `dataavailable` cuối luôn phát trước `stop` nên chunks đã đủ.
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: recorder.mimeType });
                resolve(blob.size > 0 ? blob : null);
            };
            recorder.stop();
        });
    }, []);

    const start = useCallback(() => {
        if (!stream) return;
        void stop();

        let recorder: MediaRecorder;
        try {
            recorder = new MediaRecorder(stream);
            recorder.start();
        } catch {
            setStatus('error');
            return;
        }

        const recording = { recorder, chunks: [] as Blob[] };
        recorder.ondataavailable = (event) => {
            if (event.data.size > 0) recording.chunks.push(event.data);
        };
        recorder.onerror = () => {
            if (recordingRef.current === recording) recordingRef.current = null;
            setStatus('error');
        };
        recordingRef.current = recording;
        setStatus('recording');
    }, [stop, stream]);

    useEffect(() => () => void stop(), [stop]);

    return { status, start, stop };
}
