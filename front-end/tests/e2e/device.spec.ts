import type { Page } from '@playwright/test';
import { denyMicrophone, expect, test } from './fixtures';

const TYPING_SAMPLE = 'Please send the meeting address to our new office by Wednesday.';

async function goToMicrophoneStep(page: Page) {
    await page.goto('/setting/device-check');
    await page.getByRole('button', { name: /Bỏ qua bước này|Tiếp tục/ }).click();
    await expect(page.getByRole('heading', { name: 'Micro', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Bật micro' }).click();
}

test('DV-H01: Đi hết 5 bước với mic giả: bước 5 báo sẵn sàng cho cả Speaking và Writing', async ({ page }) => {
    test.setTimeout(180_000);
    await page.goto('/setting/device-check');
    const next = page.getByRole('button', { name: /Tiếp tục|Xem kết quả/ });

    // 1. Loa
    await page.getByRole('button', { name: 'Phát âm thanh thử' }).click();
    await page.getByRole('button', { name: 'Nghe rõ cả hai bên', exact: true }).click();
    await next.click();

    // 2. Micro: tiếng sine của mic giả đủ to để được nhận là giọng nói
    await expect(page.getByRole('heading', { name: 'Micro', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Bật micro' }).click();
    await expect(page.getByText('Micro hoạt động tốt')).toBeVisible({ timeout: 30_000 });
    await next.click();

    // 3. Ghi âm & nghe lại
    await expect(page.getByRole('heading', { name: 'Ghi âm & nghe lại' })).toBeVisible();
    await page.getByRole('button', { name: /Ghi âm thử \d+ giây/ }).click();
    await page.getByRole('button', { name: 'Nghe lại', exact: true }).click({ timeout: 30_000 });
    await page.getByRole('button', { name: 'Rõ ràng', exact: true }).click();
    await next.click();

    // 4. Bàn phím
    await expect(page.getByRole('heading', { name: 'Bàn phím & bộ gõ' })).toBeVisible();
    await page.getByPlaceholder('Bắt đầu gõ tại đây…').pressSequentially(TYPING_SAMPLE);
    await next.click();

    // 5. Tổng kết
    await expect(page.getByRole('heading', { name: 'Sẵn sàng vào thi' })).toBeVisible();
    for (const skill of ['TOEIC Speaking', 'TOEIC Writing']) {
        await expect(page.getByRole('article', { name: skill }), skill).toContainText('Thiết bị đã sẵn sàng');
    }
});

test('DV-X01: Mic trả về lỗi NotAllowedError: thông báo cụ thể là quyền mic đang bị chặn', async ({ page }) => {
    await denyMicrophone(page, 'NotAllowedError');
    await goToMicrophoneStep(page);
    const alert = page.getByRole('alert').filter({ hasText: /micro/i });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/chặn/i);
});

test('DV-X02: Mic trả về lỗi NotFoundError: thông báo không tìm thấy mic', async ({ page }) => {
    await denyMicrophone(page, 'NotFoundError');
    await goToMicrophoneStep(page);
    await expect(page.getByRole('alert').filter({ hasText: /không tìm thấy micro/i })).toBeVisible();
});

test('DV-X03: Mic trả về lỗi NotReadableError: thông báo mic đang bị ứng dụng khác dùng', async ({ page }) => {
    await denyMicrophone(page, 'NotReadableError');
    await goToMicrophoneStep(page);
    await expect(page.getByRole('alert').filter({ hasText: /micro/i }).filter({ hasText: /ứng dụng khác/i })).toBeVisible();
});
