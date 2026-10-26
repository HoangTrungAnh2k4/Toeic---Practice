import { createUser } from './seed';
import {
    answerAllGuided,
    answerPart,
    expect,
    IDS,
    localTable,
    mockSpeakingScore,
    mockWritingScore,
    openSpeakingRoom,
    openWritingRoom,
    questionNumbers,
    ready,
    speakingResult,
    submitPart,
    supabaseWrites,
    test,
    writingOutcomes,
} from './fixtures';

const WRITING = IDS.writing.published[0];
const PART1_ANSWERS = Array(5).fill('The man goes to the office early.');

test('GU-H01: Khách luyện xong Part 1 Writing, mở /setting/history thấy lượt làm và không có request ghi lên Supabase', async ({ page, db }) => {
    const numberOf = await questionNumbers(db, WRITING);
    await mockWritingScore(page, (body) => writingOutcomes(body, numberOf, () => 2));
    const writes = supabaseWrites(page);

    await openWritingRoom(page, WRITING, { part: 6 });
    await answerPart(page, PART1_ANSWERS);
    await submitPart(page);
    await expect(page).toHaveURL(/\/setting\/history\//);

    await page.goto('/setting/history');
    await expect(page.getByRole('row').filter({ hasText: 'E2E Writing 1' }).filter({ hasText: 'Part 1' })).toBeVisible();
    expect(writes).toEqual([]);
});

test('GU-C01: Khách làm bài rồi đăng nhập: lịch sử tài khoản không có lượt làm khách, dữ liệu khách trên trình duyệt còn nguyên', async ({ page, db }) => {
    const numberOf = await questionNumbers(db, WRITING);
    await mockWritingScore(page, (body) => writingOutcomes(body, numberOf, () => 2));
    await openWritingRoom(page, WRITING, { part: 6 });
    await answerPart(page, PART1_ANSWERS);
    await submitPart(page);
    await expect(page).toHaveURL(/\/setting\/history\//);
    const guestAttempts = await localTable<{ id: string }>(page, 'attempts');
    expect(guestAttempts.length).toBeGreaterThan(0);

    const user = await createUser(db);
    await page.goto('/login');
    await ready(page);
    await page.getByLabel('Email').fill(user.email);
    await page.getByLabel('Mật khẩu', { exact: true }).fill(user.password);
    await page.getByLabel('Mật khẩu', { exact: true }).blur();
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page).not.toHaveURL(/\/login/);

    await page.goto('/setting/history');
    await expect(page.getByText('Bạn chưa làm bài nào')).toBeVisible();
    await expect(page.getByRole('row').filter({ hasText: 'E2E Writing 1' })).toHaveCount(0);
    const stillThere = await localTable<{ id: string }>(page, 'attempts');
    expect(stillThere.map((attempt) => attempt.id)).toEqual(expect.arrayContaining(guestAttempts.map((attempt) => attempt.id)));
});

test('GU-E01: Đóng banner nhắc dữ liệu khách rồi tải lại trang, banner vẫn ẩn', async ({ page }) => {
    const banner = page.getByRole('complementary', { name: 'Bạn đang làm bài ở chế độ khách' });
    await page.goto('/overview');
    await expect(banner).toBeVisible();
    await banner.getByRole('button', { name: 'Đóng thông báo' }).click();
    await expect(banner).toBeHidden();

    await page.reload();
    await ready(page);
    // Sidebar đã đọc xong phiên (khách) → banner, nếu có, cũng đã render
    await expect(page.getByText('Bạn chưa đăng nhập').first()).toBeVisible();
    await expect(banner).toHaveCount(0);
});

test('GU-H02: Khách mở /schedule thấy thẻ "Đăng ký để nhận lộ trình học riêng", không có lộ trình', async ({ page }) => {
    await page.goto('/schedule');
    await expect(page.getByRole('heading', { name: 'Đăng ký để nhận lộ trình học riêng' })).toBeVisible();
    await expect(page.locator('#weekly-task-title')).toHaveCount(0);
    await expect(page.getByRole('progressbar', { name: 'Tiến độ tuần' })).toHaveCount(0);
});

test('GU-H03: Khách làm và nộp bài Speaking: kết quả lưu ở trình duyệt, không có request ghi lượt làm lên Supabase', async ({ page, db }) => {
    const exam = IDS.speaking.published[1];
    const ids = await questionNumbers(db, exam);
    await mockSpeakingScore(page, ({ questionId }) => ({ status: 200, body: speakingResult(2, ids[questionId] === 11 ? 5 : 3) }));
    const writes = supabaseWrites(page);

    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    await expect(page).toHaveURL(/\/setting\/history\/[0-9a-f-]{36}/);

    const attempts = await localTable<{ exam_id: string; status: string; score: number | null }>(page, 'attempts');
    const done = attempts.find((attempt) => attempt.exam_id === exam);
    expect(done?.status).toBe('scored');
    expect(done?.score).not.toBeNull();
    expect(writes).toEqual([]);
});
