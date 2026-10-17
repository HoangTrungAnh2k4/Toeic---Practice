import { describe, expect, test } from 'vitest';
import { parseGrade } from './gemma';
import {
    aggregatePronunciation,
    bandsToScore,
    fluencyMetrics,
    pronunciationToScore,
    summarizeSpeaking,
    toScaledScore,
} from './scale';

describe('quy đổi điểm Speaking', () => {
    test('Azure 0–100 → 0–3', () => {
        const scores = { transcript: '', accuracy: 90, fluency: 85, completeness: 100, prosody: 80 };
        expect(pronunciationToScore(scores)).toBe(3);
        expect(pronunciationToScore({ ...scores, accuracy: 50, fluency: 50, prosody: 50, completeness: 90 })).toBe(2);
        expect(pronunciationToScore({ ...scores, accuracy: 0, fluency: 0, prosody: 0, completeness: 10 })).toBe(0);
    });

    test('gộp đoạn Azure theo số từ, completeness theo số từ đoạn văn', () => {
        const result = aggregatePronunciation(
            [
                { text: 'Hello there', words: 2, accuracy: 100, fluency: 80, prosody: 70 },
                { text: 'friend', words: 1, accuracy: 70, fluency: 80, prosody: 100 },
            ],
            'Hello there my good friend',
        );
        expect(result).toEqual({
            transcript: 'Hello there friend',
            accuracy: 90,
            fluency: 80,
            prosody: 80,
            completeness: 60,
        });
        expect(aggregatePronunciation([], 'Hello')).toBeNull();
    });

    test('band IELTS → thang câu', () => {
        expect(bandsToScore({ fluency: 9, vocabulary: 9, grammar: 9, task_response: 9 }, 3)).toBe(3);
        expect(bandsToScore({ fluency: 6, vocabulary: 6, grammar: 6, task_response: 6 }, 3)).toBe(2);
        expect(bandsToScore({ fluency: 6, vocabulary: 6, grammar: 6, task_response: 6 }, 5)).toBe(3);
        expect(bandsToScore({ fluency: 0, vocabulary: 0, grammar: 0, task_response: 0 }, 5)).toBe(0);
    });

    test('tổng thô → 0–200 bội số 10', () => {
        expect(toScaledScore(35, 35)).toBe(200);
        expect(toScaledScore(20, 35)).toBe(110);
        expect(toScaledScore(0, 35)).toBe(0);
        expect(toScaledScore(0, 0)).toBe(0);
    });

    test('tổng kết: câu chưa có điểm tính 0 và ghi lỗi', () => {
        const summary = summarizeSpeaking(
            [
                { id: 'b', number: 11 },
                { id: 'a', number: 1 },
            ],
            [
                { question_id: 'a', score: 3, feedback: 'Tốt' },
                { question_id: 'b', score: null, feedback: null },
            ],
        );
        expect(summary.score).toBe(80); // 3 / 8
        expect(summary.feedbackSummary).toBe('Câu 1: Tốt');
        expect(summary.scoringError).toContain('1 câu');
    });
});

test('số đo Fluency từ timestamp Whisper', () => {
    expect(
        fluencyMetrics(
            [
                { start: 1.5, end: 5.5, text: 'I usually go shopping' },
                { start: 8, end: 10, text: 'on weekends' },
            ],
            15,
        ),
    ).toEqual({ words: 6, words_per_minute: 60, long_pauses: 1, silence_ratio: 0.6, response_delay_sec: 1.5 });
});

test('parseGrade đọc JSON trong code fence và chặn band ngoài 0–9', () => {
    const json = '{"fluency": 6, "vocabulary": 6.5, "grammar": 5, "task_response": 7, "feedback": "Cần thêm ví dụ."}';
    expect(parseGrade('```json\n' + json + '\n```')).toMatchObject({ vocabulary: 6.5, feedback: 'Cần thêm ví dụ.' });
    expect(parseGrade(json.replace('"grammar": 5', '"grammar": 12'))).toBeNull();
    expect(parseGrade('Xin lỗi, tôi không chấm được.')).toBeNull();
});
