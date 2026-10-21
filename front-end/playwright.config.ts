import { defineConfig, devices } from '@playwright/test';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

// Biến môi trường riêng cho E2E (Supabase local, tài khoản test). Xem .env.test.example
if (existsSync('.env.test')) process.loadEnvFile('.env.test');

// An toàn: E2E chỉ được chạy với Supabase LOCAL, không bao giờ với production.
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(SUPABASE_URL)) {
  throw new Error(
    `E2E chỉ chạy với Supabase local (supabase start). NEXT_PUBLIC_SUPABASE_URL hiện là "${SUPABASE_URL}". Kiểm tra lại .env.test.`,
  );
}

// An toàn: không gọi dịch vụ ngoài thật (AI, R2). Key nào có giá trị thì dừng.
// Key chưa khai báo thì đặt rỗng: biến có sẵn trong process.env thắng .env.local, nên next dev không đọc key thật từ đó.
const EXTERNAL_KEYS = [
  'AZURE_SPEECH_KEY',
  'AZURE_SPEECH_REGION',
  'GROQ_API_KEY',
  'GEMINI_API_KEY',
  'R2_ACCOUNT_ID',
  'R2_ACCESS_KEY_ID',
  'R2_SECRET_ACCESS_KEY',
  'R2_BUCKET',
  'R2_PUBLIC_URL',
];
const leaked = [...new Set([...EXTERNAL_KEYS, ...Object.keys(process.env).filter((k) => k.startsWith('R2_'))])].filter(
  (k) => process.env[k],
);
if (leaked.length) {
  throw new Error(`E2E không được dùng key dịch vụ ngoài thật. Để trống trong .env.test và shell: ${leaked.join(', ')}`);
}
for (const k of EXTERNAL_KEYS) process.env[k] = '';

const FAKE_AUDIO = path.resolve('tests/assets/fake-speech-16k.wav');
const PORT = Number(process.env.E2E_PORT ?? 3100);
const BASE_URL = `http://localhost:${PORT}`;

// Next 16 khoá .next/dev/lock cho mỗi thư mục: đang có next dev khác (dùng .env.local) thì server E2E không lên được.
// Chỉ kiểm ở tiến trình chính; worker đọc lại config lúc server E2E (cùng PORT) đang giữ khoá.
if (!process.env.TEST_WORKER_INDEX && existsSync('.next/dev/lock')) {
  let info: { pid: number; port: number; appUrl: string } | null = null;
  try {
    info = JSON.parse(readFileSync('.next/dev/lock', 'utf8'));
  } catch {
    // Windows không cho đọc file đang bị khoá, tức là có next dev đang chạy
  }
  const alive = (pid: number) => {
    try {
      process.kill(pid, 0);
      return true;
    } catch {
      return false;
    }
  };
  if (!info || (info.port !== PORT && alive(info.pid))) {
    const where = info ? ` ở ${info.appUrl} (PID ${info.pid})` : '';
    throw new Error(
      `Đang có next dev chạy${where} trong thư mục này. Tắt dev server trước khi chạy E2E. ` +
        '(Nếu chắc chắn không còn server nào, xoá .next/dev/lock.)',
    );
  }
}

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0, // retries che giấu test chập chờn. Test chập chờn là bug cần sửa.
  workers: process.env.CI ? 2 : undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh', // hạn mức và lọc "tháng này" tính theo giờ VN
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
        launchOptions: {
          args: [
            '--use-fake-ui-for-media-stream',
            '--use-fake-device-for-media-stream',
            ...(existsSync(FAKE_AUDIO) ? [`--use-file-for-fake-audio-capture=${FAKE_AUDIO}`] : []),
          ],
        },
      },
    },
  ],
  webServer: {
    // Port riêng và không dùng lại server có sẵn: server nào khác cũng có thể đang chạy với .env.local
    command: `pnpm dev --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
