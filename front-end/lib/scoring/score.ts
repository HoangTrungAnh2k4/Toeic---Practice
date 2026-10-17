import { readPcm16Mono } from '@/lib/audio/wav';
import { assessPronunciation } from './azure';
import { gradeAnswer } from './gemma';
import { transcribe, WHISPER_MODEL } from './groq';
import { bandsToScore, fluencyMetrics, pronunciationToScore, speakingMaxScore } from './scale';

export interface QuestionToScore {
    number: number;
    partNo: number;
    task: string;
    prompt: string;
    context: string | null;
    imagePath: string | null;
    imageAlt: string | null;
}

/** Kết quả một câu, đúng tên cột của `responses`. */
export interface AnswerScore {
    score: number;
    max_score: number;
    transcript: string;
    metrics: Record<string, number>;
    feedback: string;
    scoring_model: string;
}

export class InvalidAudioError extends Error {}

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Ảnh đề Part 2 dạng base64 cho Gemma; `null` (dùng `image_alt`) khi không phải URL https hoặc tải lỗi. */
async function loadImage(path: string) {
    if (!path.startsWith('https://')) return null;
    try {
        const response = await fetch(path, { signal: AbortSignal.timeout(10_000) });
        const mimeType = response.headers.get('content-type')?.split(';')[0] ?? '';
        if (!response.ok || !mimeType.startsWith('image/')) return null;
        const bytes = await response.arrayBuffer();
        if (bytes.byteLength > MAX_IMAGE_BYTES) return null;
        return { mimeType, data: Buffer.from(bytes).toString('base64') };
    } catch {
        return null;
    }
}

const silent = (max: number, model: string): AnswerScore => ({
    score: 0,
    max_score: max,
    transcript: '',
    metrics: {},
    feedback: 'Chưa ghi nhận câu trả lời.',
    scoring_model: model,
});

/**
 * Chấm một câu Speaking từ audio trên RAM: Part 1 → Azure Pronunciation Assessment (audio phải là WAV 16 kHz),
 * Part 2–5 → Groq Whisper lấy transcript rồi Gemma chấm theo rubric IELTS. Audio không được ghi ra đâu cả.
 */
export async function scoreAnswer(question: QuestionToScore, audio: Blob): Promise<AnswerScore> {
    const max = speakingMaxScore(question.number);

    if (question.partNo === 1) {
        const pcm = readPcm16Mono(await audio.arrayBuffer(), 16000);
        if (!pcm) throw new InvalidAudioError('Part 1 audio must be 16 kHz mono PCM WAV');
        const result = await assessPronunciation(pcm, question.prompt);
        if (!result) return silent(max, 'azure-pronunciation');
        const { transcript, ...metrics } = result;
        return {
            score: pronunciationToScore(result),
            max_score: max,
            transcript,
            metrics,
            feedback:
                `Phát âm ${metrics.accuracy}/100 · Trôi chảy ${metrics.fluency}/100 · ` +
                `Ngữ điệu ${metrics.prosody}/100 · Đọc đủ ${metrics.completeness}% đoạn văn.`,
            scoring_model: 'azure-pronunciation',
        };
    }

    const { transcript, segments, duration } = await transcribe(audio);
    if (!transcript) return silent(max, WHISPER_MODEL);

    const fluency = fluencyMetrics(segments, duration);
    const image = question.partNo === 2 && question.imagePath ? await loadImage(question.imagePath) : null;
    const { feedback, model, ...bands } = await gradeAnswer({
        questionNumber: question.number,
        task: question.task,
        prompt: question.prompt,
        context: question.context,
        image,
        imageAlt: question.imageAlt,
        transcript,
        fluency,
    });
    return {
        score: bandsToScore(bands, max),
        max_score: max,
        transcript,
        metrics: { ...bands, ...fluency },
        feedback,
        scoring_model: `${WHISPER_MODEL}+${model}`,
    };
}
