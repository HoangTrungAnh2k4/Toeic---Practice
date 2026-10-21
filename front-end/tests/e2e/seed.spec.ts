/**
 * Seed test cho Playwright planner/generator.
 * Planner chạy file này để khởi tạo môi trường, và generator dùng nó làm mẫu cho test mới.
 */
import { test, expect } from './fixtures';

test('seed', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/');
});
