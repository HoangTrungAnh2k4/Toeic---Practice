import type { Page } from '@playwright/test';
import { createExam, must } from './seed';
import {
    ADMIN,
    answerPart,
    daysAgo,
    editor,
    expect,
    IDS,
    insertAttempt,
    localTable,
    mockWritingScore,
    openWritingRoom,
    questionIds,
    questionNumbers,
    STUDENT,
    submitPart,
    test,
    writingOutcomes,
} from './fixtures';

const W1 = IDS.writing.published[0];
const W2 = IDS.writing.published[1];
const timer = (page: Page) => page.getByRole('timer');

interface LocalAttempt {
    id: string;
    exam_id: string;
    part_template_id: number | null;
    ends_at: string | null;
    scoring_error: string | null;
}

/** Tua đồng hồ giả (đã dừng) tới đúng `msBeforeEnd` trước hạn của lượt làm khách vừa mở. */
async function forwardToBeforeEnd(page: Page, examId: string, msBeforeEnd: number) {
    const attempt = (await localTable<LocalAttempt>(page, 'attempts')).find((a) => a.exam_id === examId);
    if (!attempt?.ends_at) throw new Error('Lượt làm không có ends_at');
    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(now + 200);
    await page.clock.fastForward(Date.parse(attempt.ends_at) - msBeforeEnd - (now + 200));
    await page.clock.runFor(600);
}

test('WR-H01: Nộp lần lượt Part 1, Part 2, Part 3: Part 1 → ?part=2; Part 2 → ?part=3; Part 3 → trang kết quả', async ({ page, db }) => {
    const numberOf = await questionNumbers(db, W2);
    await mockWritingScore(page, (body) => writingOutcomes(body, numberOf, () => 2));
    await openWritingRoom(page, W2);
    await answerPart(page, Array(5).fill('People are working at the office.'));
    await submitPart(page);
    // `part` trên URL là id Part template: 7 = Part 2, 8 = Part 3
    await expect(page).toHaveURL(/[?&]part=7(&|$)/);

    await answerPart(page, ['Dear Sir, could you tell me when the items arrive?', 'Dear Sir, I suggest sending them next week.']);
    await submitPart(page);
    await expect(page).toHaveURL(/[?&]part=8(&|$)/);

    await answerPart(page, ['I agree that working for a large company is better because it offers more training.']);
    await submitPart(page);
    await expect(page).toHaveURL(/\/setting\/history\/[0-9a-f-]{36}$/);
});

test('WR-C01: Gõ bài Part 3 rồi tải lại trang ngay, trước khi hết debounce: nội dung được khôi phục đầy đủ', async ({ page, freshStudent }) => {
    await freshStudent();
    await openWritingRoom(page, W1, { part: 8 });
    const text = 'Large companies offer stable careers, structured training, and clear promotion paths.';
    await editor(page).click();
    await editor(page).pressSequentially(text);
    await page.reload();
    await expect(editor(page)).toHaveValue(text);
});

test('WR-X01: Mất mạng khi autosave, gõ tiếp rồi tải lại: nội dung khôi phục từ bản nháp, có cảnh báo "chưa lưu lên máy chủ"', async ({ page, freshStudent }) => {
    await freshStudent();
    await openWritingRoom(page, W1, { part: 8 });
    await page.route('**/rest/v1/**', (route) =>
        ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method()) ? route.fallback() : route.abort('internetdisconnected'),
    );
    const first = 'Working for a small company gives more responsibility.';
    const second = ' Employees learn many different skills quickly.';
    await editor(page).fill(first);
    await expect.soft(page.getByText(/chưa lưu lên máy chủ/i).first()).toBeVisible();
    await editor(page).pressSequentially(second);
    await page.waitForTimeout(800);
    await page.reload();
    await expect(editor(page)).toHaveValue(first + second);
});

test('WR-C02: CBT tua tới lúc còn 60s: đồng hồ có data-state="warning" và vùng role="status" thông báo cho trình đọc màn hình', async ({ page }) => {
    await page.clock.install();
    await openWritingRoom(page, W1);
    await forwardToBeforeEnd(page, W1, 60_000);
    await expect(timer(page)).toHaveText('01:00');
    await expect(timer(page)).toHaveAttribute('data-state', 'warning');
    const status = timer(page).locator('xpath=..').getByRole('status');
    await expect(status).toHaveText(/\S/);
});

test('WR-C03: CBT Part 1 hết 8 phút thì tự nộp Part 1 và chuyển sang ?part=2', async ({ page, db }) => {
    const numberOf = await questionNumbers(db, W1);
    await mockWritingScore(page, (body) => writingOutcomes(body, numberOf, () => 2));
    await page.clock.install();
    await openWritingRoom(page, W1);
    await editor(page).fill('A man goes to the office.');
    await forwardToBeforeEnd(page, W1, -1000);
    await page.clock.resume();
    await expect(page).toHaveURL(/[?&]part=7(&|$)/);
});

test('WR-H02: mode=guided không có giới hạn thời gian', async ({ page }) => {
    await page.clock.install();
    await openWritingRoom(page, W2, { mode: 'guided' });
    await expect(timer(page)).toHaveText('Không giới hạn');
    await expect(timer(page)).toHaveAttribute('aria-label', 'Không giới hạn thời gian');
    await page.clock.fastForward('40:00');
    await expect(timer(page)).toHaveText('Không giới hạn');
    await expect(editor(page)).not.toHaveAttribute('readonly');
    await expect(page.getByText(/Đã hết giờ/)).toHaveCount(0);
});

test('WR-E01: Part 1: từ khoá tính là đã dùng khi khác hoa thường, dính dấu câu, có hậu tố; dạng bất quy tắc không được đánh dấu', async ({ page }) => {
    await openWritingRoom(page, W1);
    const found = page.getByRole('list', { name: 'Từ khóa đã phát hiện' });
    const missing = (word: string) => found.getByText(`Thiếu "${word}"`, { exact: true });

    await editor(page).fill('He GOES to the office.');
    await expect(missing('go'), 'GOES').toHaveCount(0);
    await expect(missing('office'), 'office.').toHaveCount(0);

    await editor(page).fill('She is going to the OFFICE, quickly');
    await expect(missing('go'), 'going').toHaveCount(0);
    await expect(missing('office'), 'OFFICE,').toHaveCount(0);

    await editor(page).fill('They went to the Office!');
    await expect(missing('go'), 'went không được đánh dấu').toHaveCount(1);
    await expect(missing('office'), 'Office!').toHaveCount(0);
});

test('WR-E02: Bộ đếm từ với "Hello,  world!", "e-mail", chuỗi rỗng, chỉ khoảng trắng lần lượt 2, 1, 0, 0', async ({ page }) => {
    await openWritingRoom(page, W2);
    const count = page.locator('span', { hasText: /^Số từ:/ }).locator('strong');
    for (const [text, words] of [
        ['Hello,  world!', '2'],
        ['e-mail', '1'],
        ['', '0'],
        ['    ', '0'],
    ]) {
        await editor(page).fill(text);
        await expect(count, JSON.stringify(text)).toHaveText(words);
    }
});

test('WR-E03: Gõ chữ, bấm Ctrl+Z rồi Ctrl+Y: undo rồi redo trả lại đúng nội dung', async ({ page }) => {
    await openWritingRoom(page, W2, { part: 8 });
    const text = 'Hello world';
    await editor(page).click();
    await editor(page).pressSequentially(text);
    await expect(editor(page)).toHaveValue(text);
    await page.keyboard.press('Control+z');
    await expect(editor(page)).not.toHaveValue(text);
    await page.keyboard.press('Control+y');
    await expect(editor(page)).toHaveValue(text);
});

test('WR-E04: Câu 8 với 299 từ và với 300 từ', async () => {
    test.fixme(
        true,
        'Mơ hồ: không nêu cách nhận biết "trạng thái chưa đạt/đạt" của bộ đếm (thuộc tính, nhãn hay màu) và nội dung ghi chú "chưa đủ 300 từ khuyến nghị".',
    );
});

test('WR-X02: Chấm Part 1 có câu 5 lỗi: trang xem bài báo lỗi và có nút "Chấm lại"; request chấm lại chỉ gửi câu 5', async ({ page, db }) => {
    const numberOf = await questionNumbers(db, W1);
    const q5 = (await questionIds(db, W1))[5];
    let round = 0;
    const requests = await mockWritingScore(page, (body) => {
        round += 1;
        return writingOutcomes(body, numberOf, (number) => (round === 1 && number === 5 ? 'error' : 2));
    });
    await openWritingRoom(page, W1);
    await answerPart(page, Array(5).fill('The woman carries a box to the office.'));
    await submitPart(page);
    await expect(page).toHaveURL(/[?&]part=7(&|$)/);
    await expect
        .poll(async () => (await localTable<LocalAttempt>(page, 'attempts')).find((a) => a.part_template_id === 6)?.scoring_error)
        .toBeTruthy();
    const attempt = (await localTable<LocalAttempt>(page, 'attempts')).find((a) => a.part_template_id === 6)!;

    await page.goto(`/setting/history/${attempt.id}`);
    await expect(page.getByText(/Lỗi khi chấm/)).toBeVisible();
    await page.getByRole('button', { name: 'Chấm lại' }).click();
    await expect.poll(() => requests.length).toBe(2);
    const retry = requests[1] as { answers: { questionId: string }[] };
    expect(retry.answers.map((answer) => answer.questionId)).toEqual([q5]);
});

test('WR-C04: Admin xem trước một đề Writing draft không tạo lượt làm thật trong lịch sử', async ({ page, loginAs, adminApi, db }) => {
    test.fail(true, 'BUG-03: xem trước đề Writing nháp tạo lượt làm thật trong lịch sử của admin');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'draft', title: `E2E WR-C04 ${crypto.randomUUID().slice(0, 8)}` });
    await loginAs(ADMIN);
    await openWritingRoom(page, exam.id);
    await editor(page).fill('Preview text.');
    await page.waitForTimeout(1500);
    expect(await must(db.from('attempts').select('id').eq('exam_id', exam.id))).toEqual([]);
});

test('WR-H03: Nộp Part 1 trong lúc API chấm còn đang xử lý thì chuyển ngay sang ?part=2', async ({ page }) => {
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    let answered = false;
    await mockWritingScore(page, () => ({ status: 200, body: { outcomes: [] }, delay: pending.then(() => void (answered = true)) }));
    await openWritingRoom(page, W2);
    await answerPart(page, Array(5).fill('A man waits for the bus.'));
    await submitPart(page);
    await expect(page).toHaveURL(/[?&]part=7(&|$)/);
    expect(answered, 'API chấm vẫn chưa trả về').toBe(false);
    release();
});

test('WR-E05: Lượt Writing đang chấm: bắt đầu chấm 3 phút trước có nút "Chấm lại"; 1 phút trước hiện "Đang chấm", không có "Chấm lại"', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const now = Date.now();
    const old = await insertAttempt(db, {
        user_id: user.id,
        exam_id: W1,
        part_template_id: 6,
        status: 'scoring',
        started_at: daysAgo(0.01, now),
        submitted_at: new Date(now - 3 * 60_000).toISOString(),
        scoring_started_at: new Date(now - 3 * 60_000).toISOString(),
    });
    const recent = await insertAttempt(db, {
        user_id: user.id,
        exam_id: W2,
        part_template_id: 6,
        status: 'scoring',
        started_at: daysAgo(0.01, now),
        submitted_at: new Date(now - 60_000).toISOString(),
        scoring_started_at: new Date(now - 60_000).toISOString(),
    });

    await page.goto(`/setting/history/${old}`);
    await expect(page.getByRole('button', { name: 'Chấm lại' })).toBeVisible();

    await page.goto(`/setting/history/${recent}`);
    await expect(page.getByRole('heading', { name: 'E2E Writing 2' })).toBeVisible();
    await expect.soft(page.getByText(/đang chấm/i).first()).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chấm lại' })).toHaveCount(0);
});

test('WR-X03: Lượt Writing submitted có scoring_error: trang xem bài báo lỗi chấm và có nút "Chấm lại"', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const error = 'Chấm bài bị lỗi, hãy thử chấm lại.';
    const id = await insertAttempt(db, { user_id: user.id, exam_id: W1, part_template_id: 6, status: 'submitted', scoring_error: error });
    await page.goto(`/setting/history/${id}`);
    await expect(page.getByText(error)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Chấm lại' })).toBeVisible();
});

test('WR-S01: Học viên mở /writing/test?id=<đề draft> nhận 404, không hiện nội dung đề', async ({ page, loginAs }) => {
    await loginAs(STUDENT);
    const response = await page.goto(`/writing/test?id=${IDS.writing.draft}`);
    await expect(page.getByText('Không tìm thấy trang')).toBeVisible();
    await expect(page.getByText('E2E Writing Nháp')).toHaveCount(0);
    expect(response?.status()).toBe(404);
});
