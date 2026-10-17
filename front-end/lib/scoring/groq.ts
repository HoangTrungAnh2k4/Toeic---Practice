import { z } from 'zod';
import { ProviderQuotaError } from './errors';

export const WHISPER_MODEL = 'whisper-large-v3-turbo';

const transcriptionSchema = z.object({
    text: z.string(),
    duration: z.number(),
    segments: z
        .array(z.object({ start: z.number(), end: z.number(), text: z.string(), no_speech_prob: z.number().optional() }))
        .default([]),
});

const extension = (type: string) => (type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm');

/** Transcript + timestamp từng đoạn bằng Groq Whisper; bỏ đoạn Whisper đoán là im lặng (hay bịa "Thank you."). */
export async function transcribe(audio: Blob) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not configured');

    const form = new FormData();
    form.append('file', audio, `answer.${extension(audio.type)}`);
    form.append('model', WHISPER_MODEL);
    form.append('response_format', 'verbose_json');
    form.append('language', 'en');
    form.append('temperature', '0');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}` },
        body: form,
        signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 429) throw new ProviderQuotaError('Groq');
    if (!response.ok) throw new Error(`Groq transcription failed: ${response.status}`);

    const result = transcriptionSchema.parse(await response.json());
    const segments = result.segments.filter((segment) => (segment.no_speech_prob ?? 0) < 0.6 && segment.text.trim());
    return {
        transcript: segments.map((segment) => segment.text.trim()).join(' '),
        segments,
        duration: result.duration,
    };
}
