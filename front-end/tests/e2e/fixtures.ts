/**
 * Fixture và helper dùng chung cho E2E. Mọi mock đều nằm ở ranh giới với dịch vụ ngoài (API chấm AI, micro);
 * các con số trong mock là ĐẦU VÀO do test chọn, kết quả mong đợi lấy từ docs/test-cases.csv.
 */
import { test as base, expect, type BrowserContext, type Page, type Route } from '@playwright/test';
import { createServerClient } from '@supabase/ssr';
import { adminDb, adminSessionDb, createUser, env, IDS, must, type Db, type TestUser } from './seed';

export { expect, IDS };
export type { TestUser };

export const MISTAKE = {
    /** Writing Q8: "Không nêu rõ quan điểm trong bài luận" */
    essayOpinion: '00000000-0000-4000-8000-000000000011',
};

/** Đăng nhập bằng cookie phiên của @supabase/ssr (giống hệt cookie trình duyệt nhận khi đăng nhập qua form). */
export async function login(context: BrowserContext, user: Pick<TestUser, 'email' | 'password'>, baseURL: string) {
    const jar = new Map<string, { value: string; maxAge?: number }>();
    const client = createServerClient(env('NEXT_PUBLIC_SUPABASE_URL'), env('NEXT_PUBLIC_SUPABASE_ANON_KEY'), {
        cookies: {
            getAll: () => [...jar].map(([name, { value }]) => ({ name, value })),
            setAll: (list) => list.forEach(({ name, value, options }) => jar.set(name, { value, maxAge: options.maxAge })),
        },
    });
    const { error } = await client.auth.signInWithPassword(user);
    if (error) throw error;
    // setAll chạy trong onAuthStateChange, có thể trễ một nhịp sau khi signIn resolve
    for (let i = 0; i < 100 && jar.size === 0; i++) await new Promise((resolve) => setTimeout(resolve, 20));
    if (jar.size === 0) throw new Error('Không lấy được cookie phiên');
    const now = Date.now() / 1000;
    await context.addCookies(
        [...jar]
            .filter(([, { value }]) => value)
            .map(([name, { value, maxAge }]) => ({
                name,
                value,
                url: baseURL,
                expires: maxAge ? Math.floor(now + maxAge) : -1,
                sameSite: 'Lax' as const,
            })),
    );
}

export const STUDENT = { email: env('E2E_STUDENT_EMAIL'), password: env('E2E_STUDENT_PASSWORD'), name: 'Học Viên E2E', id: IDS.student };
export const ADMIN = { email: env('E2E_ADMIN_EMAIL'), password: env('E2E_ADMIN_PASSWORD'), name: 'Quản Trị E2E', id: IDS.admin };

interface Fixtures {
    /** Đăng nhập context hiện tại bằng tài khoản cho sẵn. */
    loginAs: (user: Pick<TestUser, 'email' | 'password'>) => Promise<void>;
    /** Tạo học viên mới (dữ liệu cá nhân sạch) và đăng nhập luôn. */
    freshStudent: () => Promise<TestUser>;
}

interface WorkerFixtures {
    /** Client service_role của Supabase test. */
    db: Db;
    /** Phiên admin test (tạo đề phải đi qua phiên admin). */
    adminApi: Db;
}

export const test = base.extend<Fixtures, WorkerFixtures>({
    // Tham số thứ hai đặt tên `provide` (thay cho `use`) để eslint không nhầm với React hook `use`
    db: [async ({}, provide) => provide(adminDb()), { scope: 'worker' }],
    adminApi: [async ({}, provide) => provide(await adminSessionDb()), { scope: 'worker' }],
    context: async ({ context, baseURL }, provide) => {
        // Bỏ qua cache `'use cache'` (danh sách đề) của next dev để trang luôn đọc dữ liệu test vừa seed
        const origin = new URL(baseURL!).origin;
        await context.route(
            (url) => url.origin === origin && !url.pathname.startsWith('/_next/'),
            (route) => route.fallback({ headers: { ...route.request().headers(), 'cache-control': 'no-cache' } }),
        );
        await provide(context);
    },
    loginAs: async ({ context, baseURL }, provide) => {
        await provide((user) => login(context, user, baseURL!));
    },
    freshStudent: async ({ db, loginAs }, provide) => {
        await provide(async () => {
            const user = await createUser(db);
            await loginAs(user);
            return user;
        });
    },
});

/* ------------------------------------------------------------------ */
/* Dữ liệu                                                             */
/* ------------------------------------------------------------------ */

/** Id câu hỏi theo số câu của một đề. */
export async function questionIds(db: Db, examId: string): Promise<Record<number, string>> {
    const rows = await must(db.from('questions').select('id, number, exam_parts!inner(exam_id)').eq('exam_parts.exam_id', examId));
    return Object.fromEntries(rows.map((row) => [row.number, row.id]));
}

type AttemptInsert = {
    user_id: string;
    exam_id: string;
    part_template_id?: number | null;
    mode?: 'cbt' | 'timed' | 'guided';
    status?: 'in_progress' | 'submitted' | 'scoring' | 'scored' | 'interrupted';
    score?: number | null;
    started_at?: string;
    submitted_at?: string | null;
    scored_at?: string | null;
    scoring_started_at?: string | null;
    scoring_error?: string | null;
    sample_viewed?: boolean;
};

/** Thêm một lượt làm bằng service_role (cột điểm client không ghi được). */
export async function insertAttempt(db: Db, attempt: AttemptInsert): Promise<string> {
    const at = attempt.started_at ?? new Date().toISOString();
    const status = attempt.status ?? 'scored';
    const done = status !== 'in_progress' && status !== 'interrupted';
    const [row] = await must(
        db
            .from('attempts')
            .insert({
                part_template_id: null,
                mode: 'cbt',
                score: null,
                ...attempt,
                status,
                started_at: at,
                submitted_at: attempt.submitted_at === undefined ? (done ? at : null) : attempt.submitted_at,
                scored_at: attempt.scored_at === undefined ? (status === 'scored' ? at : null) : attempt.scored_at,
            })
            .select('id'),
    );
    return row.id;
}

export async function insertResponse(
    db: Db,
    response: { attempt_id: string; question_id: string; text_answer?: string | null; score?: number | null; max_score?: number | null; feedback?: string | null },
): Promise<string> {
    const [row] = await must(db.from('responses').insert(response).select('id'));
    return row.id;
}

export async function insertAnnotation(
    db: Db,
    annotation: {
        response_id: string;
        mistake_pattern_id: string | null;
        quote: string;
        start_offset?: number;
        explanation?: string;
        correction?: string;
    },
): Promise<string> {
    const start = annotation.start_offset ?? 0;
    const [row] = await must(
        db
            .from('annotations')
            .insert({
                correction: 'Sửa lại cho đúng',
                explanation: 'Giải thích lỗi do test seed',
                criterion: 'task_response',
                severity: 'high',
                ...annotation,
                start_offset: start,
                end_offset: start + annotation.quote.length,
            })
            .select('id'),
    );
    return row.id;
}

/** `YYYY-MM-DD` theo giờ VN, cách hôm nay `offset` ngày. */
export function dayKey(offset = 0) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date(Date.now() + offset * 86_400_000));
}

export const daysAgo = (days: number, from = Date.now()) => new Date(from - days * 24 * 60 * 60 * 1000).toISOString();

/* ------------------------------------------------------------------ */
/* Mock API chấm (ranh giới với Azure/Groq)                            */
/* ------------------------------------------------------------------ */

export interface SpeakingCall {
    questionId: string;
    attemptId: string;
    /** Lần gọi thứ mấy cho câu này (bắt đầu từ 1). */
    call: number;
}

/** Kết quả chấm 1 câu Speaking đúng shape route trả về. */
export const speakingResult = (score: number, max: number) => ({
    score,
    max_score: max,
    transcript: 'mock transcript',
    metrics: {},
    feedback: `Mock ${score}/${max}`,
    scoring_model: 'e2e-mock',
});

function multipartField(route: Route, name: string) {
    const body = route.request().postDataBuffer()?.toString('latin1') ?? '';
    return body.match(new RegExp(`name="${name}"\\r\\n\\r\\n([^\\r]+)`))?.[1] ?? '';
}

/**
 * Chặn `/api/speaking/score`. `handler` trả status + body; `persist` (service_role) ghi `responses` khi 200 như route
 * thật làm cho người đăng nhập. `delay` giữ response lại để giả lập AI đang chấm.
 */
export async function mockSpeakingScore(
    page: Page,
    handler: (call: SpeakingCall) => { status: number; body: object; delay?: Promise<void> },
    persist?: Db,
) {
    const calls = new Map<string, number>();
    const log: SpeakingCall[] = [];
    await page.route('**/api/speaking/score', async (route) => {
        const questionId = multipartField(route, 'questionId');
        const attemptId = multipartField(route, 'attemptId');
        const call = { questionId, attemptId, call: (calls.get(questionId) ?? 0) + 1 };
        calls.set(questionId, call.call);
        log.push(call);
        const { status, body, delay } = handler(call);
        if (delay) await delay;
        if (status === 200 && persist) {
            await must(
                persist
                    .from('responses')
                    .upsert({ attempt_id: attemptId, question_id: questionId, ...body }, { onConflict: 'attempt_id,question_id' }),
            );
        }
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }).catch(() => undefined);
    });
    return log;
}

/** Kết quả chấm 1 câu Writing đúng shape `WritingScore`. */
export const writingResult = (score: number, max: number) => ({
    score,
    max_score: max,
    feedback: `Mock ${score}/${max}`,
    metrics: { words: 10 },
    scoring_model: 'e2e-mock',
    annotations: [],
});

/** Chặn `/api/writing/score` (khách gửi kèm bài). `handler` nhận body request, trả status + body. */
export async function mockWritingScore(
    page: Page,
    handler: (body: { answers?: { questionId: string; text: string }[]; attemptId?: string }) => { status: number; body: object; delay?: Promise<void> },
) {
    const requests: unknown[] = [];
    await page.route('**/api/writing/score', async (route) => {
        const json = route.request().postDataJSON();
        requests.push(json);
        const { status, body, delay } = handler(json);
        if (delay) await delay;
        await route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) }).catch(() => undefined);
    });
    return requests;
}

/** Giả lập lỗi micro: phải gọi TRƯỚC page.goto. */
export async function denyMicrophone(page: Page, name: 'NotAllowedError' | 'NotFoundError' | 'NotReadableError') {
    await page.addInitScript((errorName) => {
        Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
            configurable: true,
            value: () => Promise.reject(new DOMException('e2e mic error', errorName)),
        });
    }, name);
}

/* ------------------------------------------------------------------ */
/* Phòng thi                                                           */
/* ------------------------------------------------------------------ */

/**
 * Vào phòng thi Speaking và bật micro (đồng hồ phòng thi chỉ chạy khi micro hoạt động).
 * `freeze`: dùng đồng hồ giả, dừng nó ngay trước khi bật micro → test tua từng giây bằng `tickSeconds`.
 */
const clockInstalled = new WeakSet<Page>();

export async function openSpeakingRoom(page: Page, examId: string, mode?: string, { freeze = false } = {}) {
    if (freeze && !clockInstalled.has(page)) {
        await page.clock.install();
        clockInstalled.add(page);
    } else if (freeze) {
        await page.clock.resume();
    }
    await page.goto(`/speaking/test?id=${examId}${mode ? `&mode=${mode}` : ''}`);
    const enable = page.getByRole('button', { name: 'Bật micro' });
    await expect(enable).toBeVisible();
    if (freeze) {
        const now = await page.evaluate(() => Date.now());
        await page.clock.pauseAt(now + 2000);
    }
    await enable.click();
    await expect(page.getByText('Micro đang hoạt động')).toBeVisible();
}


/** Đồng hồ Speaking tick bằng setTimeout 1s nối tiếp nhau: tua từng giây, chờ React render giữa các nhịp. */
export async function tickSeconds(page: Page, seconds: number, timer = page.getByRole('timer')) {
    for (let i = 0; i < seconds; i++) {
        const before = await timer.textContent();
        await page.clock.runFor(1000);
        await expect(timer).not.toHaveText(before ?? '', { timeout: 5000 }).catch(() => undefined);
    }
}

/** Làm hết 11 câu Speaking ở chế độ guided: bỏ qua chuẩn bị, ghi âm ngắn, chuyển câu; câu cuối bấm Kết thúc. */
export async function answerAllGuided(page: Page, upTo = 11) {
    for (let number = 1; number <= upTo; number++) {
        await expect(page.getByText(`Đang làm câu ${number}`)).toBeVisible();
        const skip = page.getByRole('button', { name: 'Bỏ qua chuẩn bị, nói ngay' });
        if (await skip.isVisible()) await skip.click();
        await expect(page.getByText('Đang ghi âm', { exact: true })).toBeVisible();
        // MediaRecorder cần một chút thời gian để có dữ liệu
        await page.waitForTimeout(400);
        await page.getByRole('button', { name: number === 11 ? 'Kết thúc' : 'Tiếp tục' }).click();
    }
}

/** Request GHI (không phải GET/HEAD/OPTIONS) từ trình duyệt lên Supabase (REST, RPC, Storage). */
export function supabaseWrites(page: Page) {
    const supabase = new URL(env('NEXT_PUBLIC_SUPABASE_URL')).origin;
    const writes: string[] = [];
    page.on('request', (request) => {
        const url = new URL(request.url());
        if (url.origin !== supabase || url.pathname.startsWith('/auth/')) return;
        if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method())) writes.push(`${request.method()} ${url.pathname}`);
    });
    return writes;
}

/** Chờ trang tải xong JS (next dev hydrate chậm, bấm sớm thì form submit kiểu native). */
export async function ready(page: Page) {
    await page.waitForLoadState('networkidle');
}

/** Đọc một "bảng" localStorage của app (`toeco:v1:<table>`). */
export async function localTable<T = Record<string, unknown>>(page: Page, table: string): Promise<T[]> {
    return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? '[]'), `toeco:v1:${table}`);
}

/* ------------------------------------------------------------------ */
/* Phòng thi Writing                                                   */
/* ------------------------------------------------------------------ */

/** `part` là id Part template: 6 = Part 1 (Q1–5), 7 = Part 2 (Q6–7), 8 = Part 3 (Q8). */
export async function openWritingRoom(page: Page, examId: string, { mode, part }: { mode?: string; part?: number } = {}) {
    const params = new URLSearchParams({ id: examId });
    if (mode) params.set('mode', mode);
    if (part) params.set('part', String(part));
    await page.goto(`/writing/test?${params}`);
    await expect(editor(page)).toBeVisible();
}

export const editor = (page: Page) => page.getByLabel(/Your Response/);

/** Trả lời lần lượt các câu của Part đang mở (chuyển câu bằng nút "Câu tiếp theo"). */
export async function answerPart(page: Page, answers: string[]) {
    for (const [index, text] of answers.entries()) {
        if (index > 0) await page.getByRole('button', { name: /Câu tiếp theo/ }).click();
        await editor(page).fill(text);
    }
}

export async function submitPart(page: Page) {
    await page.getByRole('button', { name: /^Nộp bài Câu/ }).click();
    await page.getByRole('button', { name: 'Đồng ý nộp bài' }).click();
}

/** Nút nộp của Part đang mở, vd `submitButton(page, 'Câu 6–7')`: đổi nhãn nghĩa là đã sang Part đó. */
export const submitButton = (page: Page, range: string) => page.getByRole('button', { name: `Nộp bài ${range}` });

/** Làm cả đề Writing (một lượt làm): trả lời đủ 3 Part, chuyển Part trong cùng phòng thi rồi nộp Part cuối. */
export async function completeWritingExam(
    page: Page,
    part1: string,
    part2 = ['Dear Sir, could you tell me when the items arrive?', 'Dear Sir, I suggest sending them next week.'],
    part3 = 'I agree that working for a large company is better because it offers more training.',
) {
    await answerPart(page, Array(5).fill(part1));
    await submitPart(page);
    await expect(submitButton(page, 'Câu 6–7')).toBeVisible();
    await answerPart(page, part2);
    await submitPart(page);
    await expect(submitButton(page, 'Câu 8')).toBeVisible();
    await answerPart(page, [part3]);
    await submitPart(page);
}

/** `outcomes` cho khách theo số câu: số = điểm, 'error' = lỗi chấm của câu đó. */
export function writingOutcomes(
    body: { answers?: { questionId: string }[] },
    numberOf: Record<string, number>,
    scoreOf: (number: number) => number | 'error',
) {
    let failed = false;
    const outcomes = (body.answers ?? []).map(({ questionId }) => {
        const number = numberOf[questionId];
        const score = scoreOf(number);
        if (score === 'error') {
            failed = true;
            return { questionId, error: 'scoring_failed' };
        }
        return { questionId, result: writingResult(score, number <= 5 ? 3 : number <= 7 ? 4 : 5) };
    });
    return { status: failed ? 502 : 200, body: { outcomes } };
}

/** Đảo `questionIds`: id → số câu. */
export async function questionNumbers(db: Db, examId: string): Promise<Record<string, number>> {
    return Object.fromEntries(Object.entries(await questionIds(db, examId)).map(([number, id]) => [id, Number(number)]));
}

/* ------------------------------------------------------------------ */
/* Trang xem bài                                                       */
/* ------------------------------------------------------------------ */

export const reviewSummary = (page: Page) => page.getByRole('region', { name: 'Tổng quan kết quả' });
/** Số điểm 0–200 lớn ở khối tổng quan (ngay trước "/ 200"). */
export const reviewScore = (page: Page) => reviewSummary(page).locator('xpath=.//span[normalize-space()="/ 200"]/preceding-sibling::span[1]');
/** Nhãn Level đứng ngay sau "/ 200". */
export const reviewLevel = (page: Page) => reviewSummary(page).locator('xpath=.//span[normalize-space()="/ 200"]/following-sibling::span[1]');
