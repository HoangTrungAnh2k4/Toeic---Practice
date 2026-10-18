import { z } from 'zod';
import { ProviderQuotaError } from './errors';

/** Chính xác trước (WER 10,3% so với 12%). Free tier giới hạn riêng từng model (20 RPM, 7.200 giây audio/giờ). */
export const WHISPER_MODELS = ['whisper-large-v3', 'whisper-large-v3-turbo'] as const;

/** Dùng khi 429 không kèm `retry-after`. */
const DEFAULT_COOLDOWN_SEC = 60;
/** Model vừa 429 → bỏ qua tới hết `retry-after` để khỏi tốn một lượt gọi mỗi câu. Theo instance server, mất khi khởi động lại. */
const cooldownUntil = new Map<string, number>();

export const isCoolingDown = (model: string) => (cooldownUntil.get(model) ?? 0) > Date.now();

export function coolDown(model: string, response: Response) {
    const retryAfter = Number(response.headers.get('retry-after')) || DEFAULT_COOLDOWN_SEC;
    cooldownUntil.set(model, Date.now() + retryAfter * 1000);
}

/** Mọi lượt đều 429 (kể cả đang cooldown) → hết quota, không phải lỗi bài. */
export const allRateLimited = (failures: string[]) => failures.every((failure) => /: 429( |$)/.test(failure));

const transcriptionSchema = z.object({
    text: z.string(),
    duration: z.number(),
    segments: z
        .array(z.object({ start: z.number(), end: z.number(), text: z.string(), no_speech_prob: z.number().optional() }))
        .default([]),
});

const extension = (type: string) => (type.includes('ogg') ? 'ogg' : type.includes('mp4') ? 'm4a' : 'webm');

/**
 * Transcript + timestamp từng đoạn bằng Groq Whisper, xoay vòng `WHISPER_MODELS` khi lỗi/429.
 * Bỏ đoạn Whisper đoán là im lặng (hay bịa "Thank you."). `model`: model đã chép thành công.
 */
export async function transcribe(audio: Blob) {
    const key = process.env.GROQ_API_KEY;
    if (!key) throw new Error('GROQ_API_KEY is not configured');

    const form = new FormData();
    form.append('file', audio, `answer.${extension(audio.type)}`);
    form.append('response_format', 'verbose_json');
    form.append('language', 'en');
    form.append('temperature', '0');

    const failures: string[] = [];
    for (const model of WHISPER_MODELS) {
        if (isCoolingDown(model)) {
            failures.push(`${model}: 429 cooldown`);
            continue;
        }
        form.set('model', model);
        let response: Response;
        try {
            response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
                method: 'POST',
                headers: { Authorization: `Bearer ${key}` },
                body: form,
                signal: AbortSignal.timeout(30_000),
            });
        } catch (error) {
            failures.push(`${model}: ${error instanceof Error ? error.name : 'network'}`);
            continue;
        }
        if (!response.ok) {
            if (response.status === 429) coolDown(model, response);
            failures.push(`${model}: ${response.status}`);
            continue;
        }

        const result = transcriptionSchema.parse(await response.json());
        const segments = result.segments.filter((segment) => (segment.no_speech_prob ?? 0) < 0.6 && segment.text.trim());
        return {
            transcript: segments.map((segment) => segment.text.trim()).join(' '),
            segments,
            duration: result.duration,
            model,
        };
    }
    if (allRateLimited(failures)) throw new ProviderQuotaError('Groq');
    throw new Error(`Groq transcription failed (${failures.join(', ')})`);
}
