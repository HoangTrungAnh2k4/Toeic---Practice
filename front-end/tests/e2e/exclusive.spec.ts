/**
 * Case cần toàn bộ DB cho riêng mình (không còn đề published nào). Chạy ở project `exclusive`, sau mọi test khác.
 */
import { must } from './seed';
import { dayKey, expect, test } from './fixtures';

test('PL-H04: Không còn đề published nào, rồi lưu mục tiêu: lộ trình vẫn được tạo; task hiện "Chọn đề"', async ({ page, db, freshStudent }) => {
    await must(db.from('exams').update({ status: 'draft' }).eq('status', 'published'));
    expect(await must(db.from('exams').select('id').eq('status', 'published'))).toEqual([]);

    await freshStudent();
    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Mục tiêu & Lịch thi' }).click();
    const dialog = page.getByRole('dialog', { name: 'Mục tiêu & Lịch thi' });
    await dialog.getByLabel('Mục tiêu Speaking').click();
    await page.getByRole('option', { name: '150 điểm', exact: true }).click();
    await dialog.getByLabel('Ngày thi').fill(dayKey(30));
    await page.getByRole('button', { name: /^Lưu & tạo/ }).click();
    await expect(dialog).toBeHidden();
    const table = page.locator('section[aria-labelledby="weekly-task-title"]');
    await expect(table).toBeVisible();
    await expect(table.getByRole('link', { name: 'Chọn đề' }).first()).toBeVisible();
});
