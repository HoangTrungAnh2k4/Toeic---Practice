import type { Page } from '@playwright/test';
import { createExam, must } from './seed';
import { expect, IDS, insertAttempt, insertResponse, questionIds, test } from './fixtures';

// Các case đếm đề published của thư viện Speaking chạy tuần tự trong một worker; LB-E01 thêm đề thứ 7 nên đứng sau.
// Không test nào khác tạo đề Speaking published.
test.describe.configure({ mode: 'default' });

const PUBLISHED = [1, 2, 3, 4, 5, 6].map((n) => `E2E Speaking ${n}`);
const list = (page: Page) => page.getByRole('region', { name: 'Danh sách bộ đề Speaking' });
const cardTitles = (page: Page) => list(page).getByRole('article').getByRole('heading').allInnerTexts();
const card = (page: Page, title: string) => list(page).getByRole('article', { name: title });

async function waitForCards(page: Page) {
    await expect(list(page).getByRole('article').first()).toBeVisible();
}

test('LB-C01: Seed 3 đề Speaking draft/review/published, mở /speaking chỉ thấy đề published', async ({ page }) => {
    await page.goto('/speaking');
    await waitForCards(page);
    const titles = await cardTitles(page);
    expect(titles.sort()).toEqual([...PUBLISHED].sort());
    await expect(page.getByText('E2E Speaking Nháp')).toHaveCount(0);
    await expect(page.getByText('E2E Speaking Chờ duyệt')).toHaveCount(0);
});

test('LB-E02: Chọn chủ đề và trạng thái rồi tải lại trang: URL chứa bộ lọc, bộ lọc và kết quả giữ nguyên', async ({ page }) => {
    await page.goto('/speaking');
    await waitForCards(page);
    await page.getByLabel('Lọc theo chủ đề').selectOption({ label: 'Workplace & Office' });
    await expect(page).toHaveURL(/topic=office/);
    await page.getByLabel('Lọc theo trạng thái').selectOption({ label: 'Chưa làm' });
    await expect(page).toHaveURL(/topic=office/);
    await expect(page).toHaveURL(/status=not_started/);
    await waitForCards(page);
    const before = await cardTitles(page);

    await page.reload();
    await waitForCards(page);
    await expect(page.getByLabel('Lọc theo chủ đề')).toHaveValue('office');
    await expect(page.getByLabel('Lọc theo trạng thái')).toHaveValue('not_started');
    expect(await cardTitles(page)).toEqual(before);
});

test('LB-E03: Tìm một mã đề không tồn tại hiện trạng thái rỗng, không lỗi', async ({ page }) => {
    await page.goto('/speaking');
    await waitForCards(page);
    await page.getByLabel('Tìm kiếm đề Speaking').fill('SP-99999');
    await expect(page).toHaveURL(/q=SP-99999/);
    await expect(page.getByText('Không tìm thấy bộ đề phù hợp')).toBeVisible();
    await expect(list(page).getByRole('article')).toHaveCount(0);
    await expect(page.getByText(/Không tải được|Đã xảy ra lỗi/)).toHaveCount(0);
});

test('LB-H01: Đánh dấu 1 đề, mở tab "Đã đánh dấu", tải lại trang: đề có trong tab và vẫn còn sau khi tải lại', async ({ page }) => {
    await page.goto('/speaking');
    await waitForCards(page);
    await card(page, 'E2E Speaking 2').getByRole('button', { name: 'Đánh dấu E2E Speaking 2' }).click();
    await expect(card(page, 'E2E Speaking 2').getByRole('button', { name: 'Bỏ đánh dấu E2E Speaking 2' })).toHaveAttribute('aria-pressed', 'true');

    await page.getByRole('navigation', { name: 'Hình thức luyện tập' }).getByRole('link', { name: /Đã đánh dấu/ }).click();
    await expect(page).toHaveURL(/tab=bookmark/);
    await expect(card(page, 'E2E Speaking 2')).toBeVisible();

    await page.reload();
    await expect(card(page, 'E2E Speaking 2')).toBeVisible();
});

test('LB-X01: Đánh dấu đề trong lúc request ghi bị lỗi mạng: biểu tượng quay về trạng thái cũ và có thông báo lỗi', async ({ page, freshStudent }) => {
    await freshStudent();
    await page.route('**/rest/v1/bookmarks**', (route) =>
        route.request().method() === 'GET' ? route.fallback() : route.abort('internetdisconnected'),
    );
    await page.goto('/speaking');
    await waitForCards(page);
    const button = card(page, 'E2E Speaking 3').getByRole('button', { name: /đánh dấu E2E Speaking 3/i });
    await expect(button).toHaveAttribute('aria-pressed', 'false');
    await button.click();
    await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toBeVisible();
    await expect(button).toHaveAttribute('aria-pressed', 'false');
});

test('LB-H02: Có một đề đang làm dở: thẻ đề hiện nút làm tiếp, bấm vào mở đúng lượt đang dở', async ({ page, freshStudent, db }) => {
    const user = await freshStudent();
    const exam = IDS.speaking.published[3];
    const attemptId = await insertAttempt(db, { user_id: user.id, exam_id: exam, status: 'in_progress' });
    await insertResponse(db, { attempt_id: attemptId, question_id: (await questionIds(db, exam))[1], score: 2, max_score: 3 });

    await page.goto('/speaking');
    await waitForCards(page);
    await card(page, 'E2E Speaking 4').getByRole('link', { name: 'Tiếp tục làm bài' }).click();
    await expect(page).toHaveURL(new RegExp(`/speaking/test\\?id=${exam}`));
    // Lượt dở đã chấm câu 1 → làm tiếp từ câu 2
    await expect(page.getByText('Đang làm câu 2')).toBeVisible();
    const attempts = await must(db.from('attempts').select('id, status').eq('user_id', user.id));
    expect(attempts).toEqual([{ id: attemptId, status: 'in_progress' }]);
});

test('LB-E01: Với đúng 6 đề published không có trang 2; thêm đề thứ 7 thì trang 2 có đúng 1 đề', async ({ page, db, adminApi }) => {
    const published = await must(db.from('exams').select('id').eq('skill', 'speaking').eq('status', 'published'));
    expect(published, 'tiền điều kiện: seed đúng 6 đề').toHaveLength(6);

    await page.goto('/speaking');
    await waitForCards(page);
    const pagination = page.getByRole('navigation', { name: 'Phân trang' });
    await expect(pagination.getByRole('link', { name: '2', exact: true })).toHaveCount(0);
    await expect(pagination.getByLabel('Trang tiếp')).toHaveAttribute('aria-disabled', 'true');

    await createExam(adminApi, { skill: 'speaking', status: 'published', title: 'E2E Speaking 7', topic: 'strategy' });
    await page.goto('/speaking?page=2');
    await waitForCards(page);
    await expect(list(page).getByRole('article')).toHaveCount(1);
});

test('LB-E04: Mở /speaking?topic=khong-co&status=abc&page=999 thì bỏ qua giá trị lạ, dùng mặc định, trang không vỡ', async ({ page, db, adminApi }) => {
    // Cần ≥ 2 trang để kiểm "trang 1" có ý nghĩa
    const published = await must(db.from('exams').select('id').eq('skill', 'speaking').eq('status', 'published'));
    if (published.length < 7) await createExam(adminApi, { skill: 'speaking', status: 'published', title: 'E2E Speaking 7', topic: 'strategy' });

    await page.goto('/speaking?topic=khong-co&status=abc&page=999');
    await waitForCards(page);
    await expect(page.getByLabel('Lọc theo chủ đề')).toHaveValue('all');
    await expect(page.getByLabel('Lọc theo trạng thái')).toHaveValue('all');
    await expect(page.getByRole('navigation', { name: 'Phân trang' }).locator('[aria-current=page]')).toHaveText('1');
});
