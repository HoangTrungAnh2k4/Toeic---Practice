/**
 * Đăng nhập một lần, lưu phiên cho học viên và admin.
 * Tài khoản test phải được seed trên Supabase LOCAL; không dùng tài khoản thật.
 * Healer được phép sửa selector trong file này nếu giao diện đổi.
 */
import { test as setup, expect } from '@playwright/test';
import { STORAGE } from './fixtures';

const accounts = [
  { name: 'student', file: STORAGE.student, email: process.env.E2E_STUDENT_EMAIL, password: process.env.E2E_STUDENT_PASSWORD },
  { name: 'admin', file: STORAGE.admin, email: process.env.E2E_ADMIN_EMAIL, password: process.env.E2E_ADMIN_PASSWORD },
];

for (const acc of accounts) {
  setup(`đăng nhập ${acc.name}`, async ({ page }) => {
    if (!acc.email || !acc.password) {
      throw new Error(`Thiếu E2E_${acc.name.toUpperCase()}_EMAIL / _PASSWORD trong .env.test`);
    }
    await page.goto('/login');
    await page.getByLabel('Email').fill(acc.email);
    await page.getByLabel('Mật khẩu').fill(acc.password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    await expect(page).not.toHaveURL(/\/login/);
    await page.context().storageState({ path: acc.file });
  });
}
