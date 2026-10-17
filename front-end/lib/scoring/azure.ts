import * as sdk from 'microsoft-cognitiveservices-speech-sdk';
import { aggregatePronunciation, type PronunciationSegment } from './scale';

const TIMEOUT_MS = 60_000;

/**
 * Chấm phát âm Part 1 (đọc to) bằng Azure Pronunciation Assessment. Dùng Speech SDK recognition liên tục vì REST
 * short audio chỉ chấm tối đa 30s mà Part 1 cho nói 45s. `pcm`: PCM 16-bit mono 16 kHz. `null` khi không có lời nói.
 */
export function assessPronunciation(pcm: ArrayBuffer, referenceText: string) {
    const { AZURE_SPEECH_KEY, AZURE_SPEECH_REGION } = process.env;
    if (!AZURE_SPEECH_KEY || !AZURE_SPEECH_REGION) throw new Error('Azure Speech env is not configured');

    const speechConfig = sdk.SpeechConfig.fromSubscription(AZURE_SPEECH_KEY, AZURE_SPEECH_REGION);
    speechConfig.speechRecognitionLanguage = 'en-US';
    const stream = sdk.AudioInputStream.createPushStream(sdk.AudioStreamFormat.getWaveFormatPCM(16000, 16, 1));
    stream.write(pcm);
    stream.close();
    const recognizer = new sdk.SpeechRecognizer(speechConfig, sdk.AudioConfig.fromStreamInput(stream));

    // Miscue tắt: ở chế độ liên tục mỗi đoạn bị so với cả đoạn văn nên phần chưa đọc tới bị tính là bỏ sót
    const assessment = new sdk.PronunciationAssessmentConfig(
        referenceText,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Word,
        false,
    );
    assessment.enableProsodyAssessment = true;
    assessment.applyTo(recognizer);

    const segments: PronunciationSegment[] = [];
    return new Promise<ReturnType<typeof aggregatePronunciation>>((resolve, reject) => {
        let done = false;
        const finish = (error?: Error) => {
            if (done) return;
            done = true;
            clearTimeout(timer);
            recognizer.stopContinuousRecognitionAsync(
                () => recognizer.close(),
                () => recognizer.close(),
            );
            if (error) reject(error);
            else resolve(aggregatePronunciation(segments, referenceText));
        };
        const timer = setTimeout(() => finish(new Error('Azure Speech timed out')), TIMEOUT_MS);

        recognizer.recognized = (_, event) => {
            if (event.result.reason !== sdk.ResultReason.RecognizedSpeech) return;
            const result = sdk.PronunciationAssessmentResult.fromResult(event.result);
            segments.push({
                text: event.result.text,
                words: result.detailResult.Words.length,
                accuracy: result.accuracyScore,
                fluency: result.fluencyScore,
                prosody: result.prosodyScore,
            });
        };
        // Hết stream cũng phát `canceled` (EndOfStream) → coi là xong
        recognizer.canceled = (_, event) =>
            finish(event.reason === sdk.CancellationReason.Error ? new Error(`Azure Speech: ${event.errorDetails}`) : undefined);
        recognizer.sessionStopped = () => finish();
        recognizer.startContinuousRecognitionAsync(undefined, (error) => finish(new Error(`Azure Speech: ${error}`)));
    });
}
