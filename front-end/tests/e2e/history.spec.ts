import type { Page } from '@playwright/test';
import { createExam, createUser, must } from './seed';
import { daysAgo, expect, IDS, insertAttempt, insertResponse, questionIds, reviewSummary, test } from './fixtures';

const rows = (page: Page) => page.getByRole('region', { name: 'Danh sách lượt làm bài' }).locator('tbody tr');
const rowOf = (page: Page, text: string) => rows(page).filter({ hasText: text });
const code = (attemptId: string) => `#${attemptId.slice(0, 8).toUpperCase()}`;

test('HI-H01: Có một lượt đã chấm: nút "Xem lại chi tiết" mở đúng bài đó', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const id = await insertAttempt(db, { user_id: user.id, exam_id: IDS.speaking.published[0], score: 150 });
    await page.goto('/setting/history');
    await rowOf(page, code(id)).getByRole('link', { name: 'Xem lại chi tiết' }).click();
    await expect(page).toHaveURL(new RegExp(`/setting/history/${id}$`));
    await expect(page.getByRole('heading', { name: 'E2E Speaking 1' })).toBeVisible();
});



test('HI-E01: Một bài 6 ngày trước và một bài 8 ngày trước, lọc "7 ngày" chỉ hiện bài 6 ngày trước', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const recent = await insertAttempt(db, { user_id: user.id, exam_id: IDS.speaking.published[0], score: 100, started_at: daysAgo(6) });
    const old = await insertAttempt(db, { user_id: user.id, exam_id: IDS.speaking.published[1], score: 100, started_at: daysAgo(8) });
    await page.goto('/setting/history');
    await expect(rowOf(page, code(old))).toBeVisible();
    await page.getByRole('navigation', { name: 'Khoảng thời gian' }).getByRole('link', { name: /7 ngày/ }).click();
    await expect(page).toHaveURL(/range=7d/);
    await expect(rowOf(page, code(recent))).toBeVisible();
    await expect(rowOf(page, code(old))).toHaveCount(0);
});

test('HI-E02: Bài làm lúc 23:30 ngày 30/9 giờ VN, hôm nay là 1/10, lọc "Tháng này" thì không hiện', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const year = new Date().getFullYear();
    const lastMonth = await insertAttempt(db, {
        user_id: user.id,
        exam_id: IDS.speaking.published[0],
        score: 100,
        started_at: new Date(`${year}-09-30T23:30:00+07:00`).toISOString(),
    });
    // Đối chứng: bài trong tháng 10 phải hiện
    const thisMonth = await insertAttempt(db, {
        user_id: user.id,
        exam_id: IDS.speaking.published[1],
        score: 100,
        started_at: new Date(`${year}-10-01T08:00:00+07:00`).toISOString(),
    });
    await page.clock.install({ time: new Date(`${year}-10-01T10:00:00+07:00`) });
    await page.goto('/setting/history?range=this_month');
    await expect(rowOf(page, code(thisMonth))).toBeVisible();
    await expect(rowOf(page, code(lastMonth))).toHaveCount(0);
});

test('HI-X01: Mở /setting/history/<id không tồn tại> hiện thông báo không tìm thấy lượt làm', async ({ page, freshStudent }) => {
    await freshStudent();
    await page.goto(`/setting/history/${crypto.randomUUID()}`);
    await expect(page.getByText(/không tìm thấy lượt làm/i)).toBeVisible();
});

test('HI-S01: Học viên A mở /setting/history/<id bài của học viên B> không thấy bất kỳ nội dung nào trong bài của B', async ({ page, db, freshStudent }) => {
    const studentB = await createUser(db);
    const exam = IDS.speaking.published[2];
    const secret = `SECRET-B-${crypto.randomUUID().slice(0, 8)}`;
    const attemptB = await insertAttempt(db, { user_id: studentB.id, exam_id: exam, score: 170 });
    await insertResponse(db, { attempt_id: attemptB, question_id: (await questionIds(db, exam))[11], text_answer: secret, score: 4, max_score: 5, feedback: secret });

    await freshStudent();
    await page.goto(`/setting/history/${attemptB}`);
    // Chờ trang tải xong (một trong hai trạng thái) rồi mới kiểm tra
    await expect(page.getByText(/không tìm thấy lượt làm/i).or(reviewSummary(page)).first()).toBeVisible();
    await expect(page.getByText(secret)).toHaveCount(0);
    await expect(reviewSummary(page)).toHaveCount(0);
    await expect(page.getByText('170')).toHaveCount(0);
});

test('HI-E03: Có lượt làm của một đề, admin trả đề về nháp: lượt làm cũ vẫn hiện trong Lịch sử và xem lại được', async ({ page, db, adminApi, freshStudent }) => {
    const title = `E2E HI-E03 ${crypto.randomUUID().slice(0, 8)}`;
    const exam = await createExam(adminApi, { skill: 'writing', status: 'published', title });
    const user = await freshStudent();
    const id = await insertAttempt(db, { user_id: user.id, exam_id: exam.id, part_template_id: 6, score: 120 });
    await page.goto('/setting/history');
    await expect(rowOf(page, code(id)), 'tiền điều kiện').toBeVisible();

    await must(db.from('exams').update({ status: 'draft', review_note: 'Trả về nháp (E2E)' }).eq('id', exam.id));
    await page.reload();
    await expect(rowOf(page, code(id))).toContainText(title);
    await rowOf(page, code(id)).getByRole('link', { name: 'Xem lại chi tiết' }).click();
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(reviewSummary(page)).toBeVisible();
});

test('HI-E04: Mở /setting/history?size=7 thì bỏ qua giá trị lạ, dùng 10 dòng/trang; trang không vỡ', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    for (let i = 0; i < 11; i++) {
        await insertAttempt(db, { user_id: user.id, exam_id: IDS.speaking.published[i % 6], score: 100, started_at: daysAgo(i + 1) });
    }
    await page.goto('/setting/history?size=7');
    await expect(page.getByLabel('Số dòng mỗi trang')).toHaveText('10 dòng');
    await expect(rows(page)).toHaveCount(10);
});
