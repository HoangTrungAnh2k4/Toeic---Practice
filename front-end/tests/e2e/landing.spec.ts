import { expect, test } from './fixtures';

test('LD-E01: FAQ mở câu 1, sau đó mở câu 2 thì chỉ câu 2 đang mở', async ({ page }) => {
    await page.goto('/');
    const items = page.locator('#faq details');
    const isOpen = (index: number) => items.nth(index).evaluate((el) => (el as HTMLDetailsElement).open);
    if (!(await isOpen(0))) await items.nth(0).locator('summary').click();
    expect(await isOpen(0)).toBe(true);
    await items.nth(1).locator('summary').click();
    await expect.poll(() => isOpen(1)).toBe(true);
    const states = await items.evaluateAll((all) => all.map((el) => (el as HTMLDetailsElement).open));
    expect(states.filter(Boolean)).toHaveLength(1);
});

test('LD-H01: Bấm nút "Thi thử" ở hero chuyển tới /writing', async ({ page }) => {
    await page.goto('/');
    const hero = page.locator('section[aria-labelledby="landing-hero-title"]');
    await hero.getByRole('link', { name: /Thi thử/i }).or(hero.getByRole('button', { name: /Thi thử/i })).first().click({ timeout: 15_000 });
    await expect(page).toHaveURL(/\/writing$/);
});

test('LD-C01: Câu FAQ về cách đăng nhập mô tả đăng nhập bằng email + mật khẩu, khớp luồng ở AU', async ({ page }) => {
    test.fail(true, 'BUG-01: FAQ ghi đăng nhập bằng Google hoặc email + OTP, không cần mật khẩu');
    await page.goto('/');
    const item = page.locator('#faq details').filter({ hasText: 'hình thức đăng nhập' });
    await item.locator('summary').click();
    const answer = item.locator('p');
    await expect(answer).toBeVisible();
    await expect(answer).toContainText(/email/i);
    await expect(answer).toContainText(/mật khẩu/i);
    await expect(answer).not.toContainText(/OTP|không cần nhớ mật khẩu/i);
});
