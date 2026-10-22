import { defineConfig, devices } from '@playwright/test';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

// Supabase TEST riêng cho E2E (xem .env.test.example, tests/e2e/supabase.mjs)
if (!existsSync('.env.test')) throw new Error('Thiếu .env.test: copy từ .env.test.example rồi chạy `node tests/e2e/supabase.mjs start`.');
process.loadEnvFile('.env.test');

const supabaseUrl = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'http://invalid');
if (!['127.0.0.1', 'localhost'].includes(supabaseUrl.hostname) || supabaseUrl.port === '54321') {
    throw new Error(`E2E chỉ chạy với Supabase test local (cổng 55321), không phải ${supabaseUrl.origin}.`);
}

// Biến có sẵn trong process.env thắng .env.local: đặt rỗng để next dev không đọc key thật của Azure/Groq/Gemini/R2
for (const key of [
    'AZURE_SPEECH_KEY',
    'AZURE_SPEECH_REGION',
    'GROQ_API_KEY',
    'GEMINI_API_KEY',
    'R2_ACCOUNT_ID',
    'R2_ACCESS_KEY_ID',
    'R2_SECRET_ACCESS_KEY',
    'R2_BUCKET',
    'R2_PUBLIC_URL',
]) {
    if (process.env[key]) throw new Error(`${key} phải để trống khi chạy E2E.`);
    process.env[key] = '';
}

/** Micro giả phát tiếng sine liên tục (đủ to để bước kiểm tra micro nhận là có tiếng nói). */
const FAKE_AUDIO = path.resolve('tests/e2e/.cache/tone.wav');
if (!existsSync(FAKE_AUDIO)) {
    const rate = 16000;
    const samples = rate * 2;
    const wav = Buffer.alloc(44 + samples * 2);
    wav.write('RIFF', 0);
    wav.writeUInt32LE(36 + samples * 2, 4);
    wav.write('WAVEfmt ', 8);
    wav.writeUInt32LE(16, 16);
    wav.writeUInt16LE(1, 20);
    wav.writeUInt16LE(1, 22);
    wav.writeUInt32LE(rate, 24);
    wav.writeUInt32LE(rate * 2, 28);
    wav.writeUInt16LE(2, 32);
    wav.writeUInt16LE(16, 34);
    wav.write('data', 36);
    wav.writeUInt32LE(samples * 2, 40);
    for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin((2 * Math.PI * 440 * i) / rate) * 16000), 44 + i * 2);
    mkdirSync(path.dirname(FAKE_AUDIO), { recursive: true });
    writeFileSync(FAKE_AUDIO, wav);
}

const PORT = 3100;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: process.env.CI ? 2 : 4,
    // next dev biên dịch route lần đầu khá lâu
    timeout: 120_000,
    expect: { timeout: 15_000 },
    reporter: [['list'], ['html', { open: 'never' }], ['json', { outputFile: 'test-results/results.json' }]],
    use: {
        baseURL: BASE_URL,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        locale: 'vi-VN',
        timezoneId: 'Asia/Ho_Chi_Minh',
        navigationTimeout: 60_000,
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
        launchOptions: {
            args: [
                '--use-fake-ui-for-media-stream',
                '--use-fake-device-for-media-stream',
                `--use-file-for-fake-audio-capture=${FAKE_AUDIO}`,
            ],
        },
    },
    projects: [
        // Seed dữ liệu nền; `exclusive` chạy sau cùng (kể cả khi có test fail) vì cần toàn bộ DB cho riêng mình
        { name: 'seed', testMatch: /seed\.setup\.ts/, teardown: 'exclusive' },
        { name: 'main', dependencies: ['seed'], testIgnore: /(seed\.setup|exclusive\.spec)\.ts/ },
        { name: 'exclusive', testMatch: /exclusive\.spec\.ts/ },
    ],
    webServer: {
        // Cổng riêng, không dùng lại server có sẵn: server đang chạy có thể đang dùng .env.local
        command: `pnpm dev --port ${PORT}`,
        url: BASE_URL,
        reuseExistingServer: false,
        timeout: 180_000,
    },
});
