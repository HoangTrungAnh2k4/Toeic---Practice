import { readPcm16Mono } from '@/lib/audio/wav';
import { assessPronunciation } from './azure';
import { gradeAnswer } from './grade';
import { transcribe } from './groq';
import { bandsToScore, fluencyMetrics, pronunciationToScore, speakingMaxScore } from './scale';

export interface QuestionToScore {
    number: number;
    partNo: number;
    task: string;
    prompt: string;
    context: string | null;
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
 * Part 2–5 → Groq Whisper lấy transcript rồi LLM trên Groq chấm theo rubric IELTS. Audio không được ghi ra đâu cả.
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

    const { transcript, segments, duration, model: whisperModel } = await transcribe(audio);
    if (!transcript) return silent(max, whisperModel);

    const fluency = fluencyMetrics(segments, duration);
    const { feedback, model, ...bands } = await gradeAnswer({
        questionNumber: question.number,
        task: question.task,
        prompt: question.prompt,
        context: question.context,
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
        scoring_model: `${whisperModel}+${model}`,
    };
}
