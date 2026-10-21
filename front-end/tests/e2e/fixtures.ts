/**
 * Fixtures dùng chung. File này do NGƯỜI sở hữu; agent không được sửa.
 * Mọi helper có try/catch, mock hay đường tắt đều nằm ở đây để người review được.
 */
import { test as base, expect, type Page } from '@playwright/test';

export { expect };

export const STORAGE = {
  student: '.auth/student.json',
  admin: '.auth/admin.json',
} as const;

type Skill = 'speaking' | 'writing';
type MicError = 'NotAllowedError' | 'NotFoundError' | 'NotReadableError';

/**
 * Mock API chấm điểm.
 * Đây là ranh giới với dịch vụ AI bên ngoài (Azure, Groq), nên được phép mock.
 * Mock chỉ giả lập ĐẦU VÀO cho giao diện. Expected value vẫn phải lấy từ oracle.
 */
export class ScoringMock {
  constructor(private readonly page: Page) {}

  /**
   * Hết hạn mức chấm (429 `daily_limit`), đúng dạng response của route handler:
   * - Speaking: `{ error }`.
   * - Writing của khách: `{ outcomes: [{ questionId, error }] }` cho từng câu gửi lên.
   * - Writing của người đăng nhập: `{ status: 'submitted', scoringError }`. Route thật tự ghi lỗi vào `attempts`;
   *   mock ở trình duyệt KHÔNG ghi DB, nên case cần trạng thái "lỗi chấm" phải seed `scoring_error` vào Supabase.
   */
  async quotaExceeded(skill: Skill) {
    await this.page.route(`**/api/${skill}/score`, (route) => {
      // Speaking gửi multipart nên chỉ đọc JSON với Writing
      const answers =
        skill === 'writing' ? (route.request().postDataJSON() as { answers?: { questionId: string }[] }).answers : undefined;
      const body =
        skill === 'speaking'
          ? { error: 'daily_limit' }
          : answers
            ? { outcomes: answers.map(({ questionId }) => ({ questionId, error: 'daily_limit' })) }
            : { status: 'submitted', scoringError: 'e2e mock: daily_limit' };
      return route.fulfill({ status: 429, contentType: 'application/json', body: JSON.stringify(body) });
    });
  }

  /** `times` lần đầu trả 500 (`server_error`, giống route thật), sau đó gửi request thật. */
  async serverError(skill: Skill, times = Number.POSITIVE_INFINITY) {
    let n = 0;
    await this.page.route(`**/api/${skill}/score`, (route) =>
      n++ < times
        ? route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'server_error' }) })
        : route.fallback(),
    );
  }

  async networkDown(skill: Skill) {
    await this.page.route(`**/api/${skill}/score`, (route) => route.abort('internetdisconnected'));
  }

  /**
   * Trả một response chấm thành công do bạn chuẩn bị sẵn.
   * Lấy CẤU TRÚC response từ type của route handler. Các con số là input bạn tự chọn,
   * không phải expected value.
   */
  async succeedWith(skill: Skill, body: unknown) {
    await this.page.route(`**/api/${skill}/score`, (route) =>
      route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(body) }),
    );
  }
}

/** Giả lập lỗi micro. Phải gọi TRƯỚC page.goto. */
export class MicControl {
  constructor(private readonly page: Page) {}

  async deny(kind: MicError = 'NotAllowedError') {
    await this.page.addInitScript((name) => {
      const reject = () => Promise.reject(new DOMException('e2e mic error', name));
      if (navigator.mediaDevices) {
        Object.defineProperty(navigator.mediaDevices, 'getUserMedia', { value: reject, configurable: true });
      }
    }, kind);
  }
}

/** Chặn request ghi lên Supabase (REST) để giả lập mất mạng khi autosave. */
export async function blockSupabaseWrites(page: Page) {
  await page.route('**/rest/v1/**', (route) => {
    const m = route.request().method();
    return m === 'GET' || m === 'HEAD' ? route.fallback() : route.abort('internetdisconnected');
  });
}

/** Đọc localStorage an toàn (để kiểm chế độ khách). */
export async function readLocalStorage(page: Page): Promise<Record<string, string>> {
  return page.evaluate(() => {
    const out: Record<string, string> = {};
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k) out[k] = localStorage.getItem(k) ?? '';
      }
    } catch {
      /* bị chặn storage */
    }
    return out;
  });
}

export const test = base.extend<{ scoring: ScoringMock; mic: MicControl }>({
  scoring: async ({ page }, use) => {
    await use(new ScoringMock(page));
  },
  mic: async ({ page }, use) => {
    await use(new MicControl(page));
  },
});
