import type { Page } from '@playwright/test';
import type { Db } from './seed';
import { daysAgo, expect, IDS, insertAnnotation, insertAttempt, insertResponse, MISTAKE, questionIds, test } from './fixtures';

const W1 = IDS.writing.published[0];
const STATUS = /^(Đang lặp lại|Đang cải thiện|Đã khắc phục)$/;

/** Badge trạng thái của mẫu lỗi trên trang chi tiết. */
const statusBadge = (page: Page) => page.locator('span[title]').filter({ hasText: STATUS }).first();

/**
 * Lượt Writing Part 3 (câu 8) đã chấm, mới nhất cuối danh sách. `hit`: có annotation thuộc mẫu lỗi X.
 * `sampleViewed`: bài có xem bài mẫu.
 */
async function seedEssays(db: Db, userId: string, essays: { hit: boolean; sampleViewed?: boolean }[]) {
    const q8 = (await questionIds(db, W1))[8];
    const ids: string[] = [];
    for (const [index, essay] of essays.entries()) {
        const attemptId = await insertAttempt(db, {
            user_id: userId,
            exam_id: W1,
            part_template_id: 8,
            score: 120,
            sample_viewed: essay.sampleViewed ?? false,
            started_at: daysAgo(essays.length - index),
        });
        const text = 'In my view, large companies are better because they offer training.';
        const responseId = await insertResponse(db, { attempt_id: attemptId, question_id: q8, text_answer: text, score: 3, max_score: 5 });
        if (essay.hit) await insertAnnotation(db, { response_id: responseId, mistake_pattern_id: MISTAKE.essayOpinion, quote: 'In my view' });
        ids.push(attemptId);
    }
    return ids;
}

test('MI-C01: Mẫu lỗi X xuất hiện, sau đó 3 bài độc lập liên tiếp không lặp lại X: X ở trạng thái "Đã khắc phục"', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    await seedEssays(db, user.id, [{ hit: true }, { hit: false }, { hit: false }, { hit: false }]);
    await page.goto(`/mistakes/${MISTAKE.essayOpinion}`);
    await expect(statusBadge(page)).toHaveText('Đã khắc phục');
});

test('MI-E01: Giống MI-C01 nhưng chỉ có 2 bài sau đó: X chưa "Đã khắc phục"', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    await seedEssays(db, user.id, [{ hit: true }, { hit: false }, { hit: false }]);
    await page.goto(`/mistakes/${MISTAKE.essayOpinion}`);
    await expect(statusBadge(page)).toBeVisible();
    await expect(statusBadge(page)).not.toHaveText('Đã khắc phục');
});

test('MI-E02: 3 bài không lặp X nhưng 1 bài có xem bài mẫu: X chưa "Đã khắc phục"', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    await seedEssays(db, user.id, [{ hit: true }, { hit: false }, { hit: false, sampleViewed: true }, { hit: false }]);
    await page.goto(`/mistakes/${MISTAKE.essayOpinion}`);
    await expect(statusBadge(page)).toBeVisible();
    await expect(statusBadge(page)).not.toHaveText('Đã khắc phục');
});

test('MI-H01: Mở /mistakes: bộ lọc mặc định là "Cần khắc phục"', async ({ page, freshStudent }) => {
    await freshStudent();
    await page.goto('/mistakes');
    const filter = page.getByRole('navigation', { name: 'Lọc theo trạng thái' });
    await expect(filter.getByRole('link', { name: 'Cần khắc phục' })).toHaveAttribute('aria-current', 'true');
    await expect(filter.locator('[aria-current=true]')).toHaveCount(1);
});

test('MI-E03: Annotation Writing có mistake_pattern_id = null hiện trên trang xem bài nhưng không vào Sổ lỗi', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const explanation = `Ghi chú lẻ ${crypto.randomUUID().slice(0, 8)}`;
    const attemptId = await insertAttempt(db, { user_id: user.id, exam_id: W1, part_template_id: 8, score: 120 });
    const responseId = await insertResponse(db, {
        attempt_id: attemptId,
        question_id: (await questionIds(db, W1))[8],
        text_answer: 'Companies is big and they offers training.',
        score: 3,
        max_score: 5,
    });
    await insertAnnotation(db, { response_id: responseId, mistake_pattern_id: null, quote: 'Companies is', explanation });

    await page.goto(`/setting/history/${attemptId}`);
    await expect(page.getByText(explanation).first()).toBeVisible();

    await page.goto('/mistakes?status=all');
    await expect(page.getByRole('navigation', { name: 'Lọc theo trạng thái' })).toBeVisible();
    await expect(page.getByText(/trống|Không có lỗi|Không còn lỗi/i).first()).toBeVisible();
    await expect(page.getByText(explanation)).toHaveCount(0);
    await expect(page.locator('main a[href^="/mistakes/"]')).toHaveCount(0);
});

test('MI-H02: Chưa có lỗi nào được gắn mẫu: Sổ lỗi hiện trạng thái trống', async ({ page, freshStudent }) => {
    await freshStudent();
    await page.goto('/mistakes');
    await expect(page.getByText(/trống/i).first()).toBeVisible();
    await expect(page.locator('main a[href^="/mistakes/"]')).toHaveCount(0);
});

test('MI-H03: Mẫu lỗi có bằng chứng, mở trang chi tiết: có "Vì sao" và "Cách khắc phục"; câu trích trỏ về đúng bài làm', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const [attemptId] = await seedEssays(db, user.id, [{ hit: true }]);
    await page.goto(`/mistakes/${MISTAKE.essayOpinion}`);
    await expect(page.getByRole('heading', { name: /Vì sao/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Cách khắc phục/ })).toBeVisible();
    const evidence = page.getByRole('listitem').filter({ hasText: '“In my view”' });
    await expect(evidence).toBeVisible();
    await evidence.getByRole('link', { name: 'Xem trong bài làm' }).click();
    await expect(page).toHaveURL(new RegExp(`/setting/history/${attemptId}`));
    await expect(page.getByRole('heading', { name: 'E2E Writing 1' })).toBeVisible();
});
