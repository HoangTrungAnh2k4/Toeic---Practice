/**
 * Cửa duy nhất để test lấy giá trị đúng (expected).
 * File này và các file JSON cùng thư mục do NGƯỜI sở hữu; agent không được sửa.
 *
 * Tuyệt đối không import từ code của app (lib/, app/, components/) để tính expected.
 * Nếu lấy expected từ chính code đang được test thì test luôn xanh, kể cả khi code sai.
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';

function load<T>(file: string): T {
  const p = path.resolve(process.cwd(), 'tests/oracle', file);
  return JSON.parse(readFileSync(p, 'utf8')) as T;
}

export type LevelBand = { level: number; min: number; max: number };

export type EtsFormat = {
  speaking: {
    totalQuestions: number;
    maxRawScore: number;
    parts: Array<{
      part: number;
      questions: number[];
      task: string;
      prepSec: number;
      responseSec: number[];
      readingSec?: number;
      questionScale: [number, number];
    }>;
  };
  writing: {
    totalQuestions: number;
    totalMinutes: number;
    parts: Array<{
      part: number;
      questions: number[];
      task: string;
      timeLimitSec: number;
      timeScope: 'part' | 'question';
      keywordsPerQuestion?: number;
      questionScale: [number, number];
    }>;
  };
};

export const ets = load<EtsFormat>('ets-format.json');
export const levels = load<{ speaking: LevelBand[]; writing: LevelBand[] }>('levels.json');
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const business = load<Record<string, any>>('business-rules.json');

/** Tra Level từ bảng ETS. Đây là bản tính độc lập, không dùng code của app. */
export function levelFor(skill: 'speaking' | 'writing', score: number): number {
  const band = levels[skill].find((b) => score >= b.min && score <= b.max);
  if (!band) throw new Error(`Không có Level cho ${skill} = ${score} trong oracle`);
  return band.level;
}

export function speakingPart(part: number) {
  const p = ets.speaking.parts.find((x) => x.part === part);
  if (!p) throw new Error(`Oracle không có Speaking Part ${part}`);
  return p;
}

export function writingPart(part: number) {
  const p = ets.writing.parts.find((x) => x.part === part);
  if (!p) throw new Error(`Oracle không có Writing Part ${part}`);
  return p;
}
