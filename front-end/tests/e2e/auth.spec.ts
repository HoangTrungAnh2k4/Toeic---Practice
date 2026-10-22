import type { Locator, Page } from '@playwright/test';
import { createExam, createUser, E2E_DOMAIN, must } from './seed';
import { expect, IDS, STUDENT, test } from './fixtures';

const uniqueEmail = () => `reg-${crypto.randomUUID().slice(0, 10)}@${E2E_DOMAIN}`;

/** Lỗi gắn với đúng ô nhập: phần tử `field-error` nằm trong cùng khối Field với ô đó (ngay dưới ô). */
const errorUnder = (input: Locator) =>
    input.locator('xpath=ancestor::*[@data-slot="field"][1]').locator('[data-slot=field-error]');

/**
 * Ô mật khẩu hiện dòng gợi ý khi đang focus; bấm chuột sang control khác làm gợi ý ẩn đi, layout dịch lên và cú click
 * trượt khỏi control (lỗi UI riêng, không thuộc các case ở đây) → blur ô trước khi thao tác tiếp.
 */
async function fillPassword(input: Locator, value: string) {
    await input.fill(value);
    await input.blur();
}

async function fillRegister(page: Page, { name = 'Nguyễn Văn E2E', email = uniqueEmail(), password = 'abcd1234', terms = true }) {
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Họ và tên').fill(name);
    await page.getByLabel('Email').fill(email);
    await fillPassword(page.getByLabel('Mật khẩu', { exact: true }), password);
    if (terms) await page.getByRole('checkbox').check();
}

/** Đếm request đăng ký gửi lên Supabase Auth. */
function countSignups(page: Page) {
    const calls: string[] = [];
    page.on('request', (request) => {
        if (request.url().includes('/auth/v1/signup')) calls.push(request.url());
    });
    return calls;
}

const sessionCookies = async (page: Page) =>
    (await page.context().cookies()).filter((cookie) => /^sb-.*-auth-token/.test(cookie.name));

async function loginViaForm(page: Page, email: string, password: string, remember: boolean) {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill(email);
    await fillPassword(page.getByLabel('Mật khẩu', { exact: true }), password);
    const checkbox = page.getByRole('checkbox', { name: 'Ghi nhớ đăng nhập' });
    if (remember) await checkbox.check();
    else await checkbox.uncheck();
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
}

test('AU-H01: Đăng ký với họ tên, email chưa dùng, mật khẩu abcd1234 chuyển sang /verify-email', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { password: 'abcd1234' });
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page).toHaveURL(/\/verify-email(\?|$)/);
});

test('AU-E01: Đăng ký với mật khẩu 7 ký tự báo lỗi ngay dưới ô mật khẩu và không gửi form', async ({ page }) => {
    const signups = countSignups(page);
    await page.goto('/register');
    await fillRegister(page, { password: 'abc1234' });
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(errorUnder(page.getByLabel('Mật khẩu', { exact: true }))).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);
    expect(signups).toHaveLength(0);
});

test('AU-E02: Mật khẩu 8 ký tự toàn chữ, rồi toàn số', async () => {
    test.fixme(true, 'Mơ hồ: "Cả hai đúng" không rõ là cả hai mật khẩu được chấp nhận hay hệ thống xử lý đúng (từ chối) cả hai.');
});

test('AU-E03: Mật khẩu đúng 8 ký tự có cả chữ và số abcdefg1 là hợp lệ (biên dưới)', async ({ page }) => {
    await page.goto('/register');
    const password = page.getByLabel('Mật khẩu', { exact: true });
    await fillRegister(page, { password: 'abcdefg1' });
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page).toHaveURL(/\/verify-email(\?|$)/);
    await expect(errorUnder(password)).toHaveCount(0);
});

test('AU-E04: Mật khẩu có khoảng trắng hoặc chữ có dấu là không hợp lệ', async ({ page }) => {
    const signups = countSignups(page);
    for (const value of ['mật khẩu1', 'abcd 1234', 'mậtkhẩu12']) {
        await page.goto('/register');
        await fillRegister(page, { password: value });
        await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
        await expect(errorUnder(page.getByLabel('Mật khẩu', { exact: true })), `mật khẩu "${value}"`).toBeVisible();
        await expect(page).toHaveURL(/\/register$/);
    }
    expect(signups).toHaveLength(0);
});

test('AU-H02: Đăng nhập đúng email và mật khẩu', async () => {
    test.fixme(true, 'Mơ hồ: kết quả mong đợi ghi "Vào trang (/overview?)" — chưa chốt trang đích sau đăng nhập.');
});

test('AU-X01: Đăng nhập sai mật khẩu hiện thông báo tiếng Việt, ở lại /login, không lộ thông báo gốc của Supabase', async ({ page }) => {
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill(STUDENT.email);
    await fillPassword(page.getByLabel('Mật khẩu', { exact: true }), 'SaiMatKhau123');
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    const alert = page.getByRole('alert').filter({ hasText: /\S/ });
    await expect(alert).toBeVisible();
    // Có dấu tiếng Việt
    await expect(alert).toHaveText(/[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i);
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.locator('body')).not.toContainText(/invalid login credentials|invalid_credentials/i);
});

test('AU-C01: Đăng nhập với "Ghi nhớ đăng nhập" TẮT tạo cookie phiên không có expires', async ({ page }) => {
    await loginViaForm(page, STUDENT.email, STUDENT.password, false);
    await expect(page).not.toHaveURL(/\/login/);
    const cookies = await sessionCookies(page);
    expect(cookies.length).toBeGreaterThan(0);
    for (const cookie of cookies) expect(cookie.expires, cookie.name).toBe(-1);
});

test('AU-C02: Đăng nhập với "Ghi nhớ đăng nhập" BẬT tạo cookie phiên hết hạn khoảng 30 ngày sau', async ({ page }) => {
    const loginAt = Date.now() / 1000;
    await loginViaForm(page, STUDENT.email, STUDENT.password, true);
    await expect(page).not.toHaveURL(/\/login/);
    const cookies = await sessionCookies(page);
    expect(cookies.length).toBeGreaterThan(0);
    const day = 24 * 60 * 60;
    for (const cookie of cookies) {
        // "khoảng 30 ngày": cho phép lệch 1 ngày
        expect(Math.abs(cookie.expires - (loginAt + 30 * day)), cookie.name).toBeLessThanOrEqual(day);
    }
});

test('AU-S01: Quên mật khẩu với email không tồn tại và email có tồn tại hiển thị giống hệt nhau', async ({ page, db }) => {
    const existing = await createUser(db);
    const missing = uniqueEmail();
    const snapshot = async (email: string) => {
        await page.goto('/forgot-password');
        await page.waitForLoadState('networkidle');
        await page.getByLabel('Email').fill(email);
        await page.getByRole('button', { name: 'Gửi mã đặt lại' }).click();
        await expect(page.getByRole('button', { name: /Đang gửi/ })).toHaveCount(0);
        await page.waitForLoadState('networkidle');
        const url = new URL(page.url());
        return {
            path: url.pathname,
            text: (await page.locator('main, body').first().innerText()).replaceAll(email, '<email>'),
        };
    };
    const forMissing = await snapshot(missing);
    // max_frequency của Supabase test là 1s
    await page.waitForTimeout(1100);
    const forExisting = await snapshot(existing.email);
    expect(forExisting).toEqual(forMissing);
});

test('AU-E05: Nhập sai mã OTP (đủ 6 số) ở /verify-email báo lỗi và vẫn ở trang này', async ({ page, db }) => {
    const user = await createUser(db, { confirmed: false });
    await page.goto(`/verify-email?email=${encodeURIComponent(user.email)}`);
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Mã xác thực').fill('000000');
    await page.getByRole('button', { name: 'Xác thực', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: /\S/ })).toBeVisible();
    await expect(page).toHaveURL(/\/verify-email/);
});

test('AU-E06: Ô OTP không nhận chữ cái và nút xác nhận bị khoá tới khi đủ 6 chữ số', async ({ page }) => {
    await page.goto(`/verify-email?email=${encodeURIComponent(uniqueEmail())}`);
    await page.waitForLoadState('networkidle');
    const otp = page.getByLabel('Mã xác thực');
    const submit = page.getByRole('button', { name: 'Xác thực', exact: true });
    await otp.pressSequentially('12a4b');
    await expect(otp).toHaveValue('124');
    await otp.fill('');
    await otp.pressSequentially('12345');
    await expect(submit).toBeDisabled();
    await otp.pressSequentially('6');
    await expect(otp).toHaveValue('123456');
    await expect(submit).toBeEnabled();
});

test('AU-H03: Đăng xuất từ menu sidebar thì sidebar hiện nút Đăng nhập/Đăng ký thay cho menu tài khoản', async ({ page, freshStudent }) => {
    const user = await freshStudent();
    await page.goto('/overview');
    const account = page.getByRole('button', { name: new RegExp(user.name) });
    await account.click();
    await page.getByRole('menuitem', { name: 'Đăng xuất' }).click();
    await expect(page.getByRole('link', { name: 'Đăng nhập', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Đăng ký', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: new RegExp(user.name) })).toHaveCount(0);
});

test('AU-S02: Khách mở thẳng /setting/exam-management bị chuyển về /login, không thấy danh sách đề', async ({ page }) => {
    const seen: string[] = [];
    page.on('response', async (response) => {
        if (response.url().includes('/setting/exam-management')) seen.push(await response.text().catch(() => ''));
    });
    await page.goto('/setting/exam-management');
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByText('E2E Speaking Nháp')).toHaveCount(0);
    expect(seen.join('')).not.toContain('E2E Speaking Nháp');
});

test('AU-S03: Học viên mở /setting/exam-management thấy trang 403, không lộ danh sách đề', async ({ page, loginAs }) => {
    await loginAs(STUDENT);
    await page.goto('/setting/exam-management');
    await expect(page.getByText(/không có quyền truy cập/i)).toBeVisible();
    await expect(page.getByText('E2E Speaking Nháp')).toHaveCount(0);
    await expect(page.getByRole('table')).toHaveCount(0);
});

/** Body hợp lệ cho POST /api/exams (đề Speaking đủ 11 câu, ảnh PNG cho câu 3–4). */
function validSpeakingExamForm(title: string) {
    const png = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
    );
    const q = (number: number, extra: object = {}) => ({
        number,
        prompt: `Question ${number}`,
        stimulus: null,
        image_path: null,
        image: null,
        image_alt: null,
        keywords: [],
        sample_answer: null,
        ...extra,
    });
    const payload = {
        title,
        topic: 'office',
        skill: 'speaking',
        parts: [
            { part_template_id: 1, context: null, questions: [q(1), q(2)] },
            {
                part_template_id: 2,
                context: null,
                questions: [q(3, { image: 'image-0', image_alt: 'A meeting room' }), q(4, { image: 'image-1', image_alt: 'A desk' })],
            },
            { part_template_id: 3, context: 'Interview about coffee', questions: [q(5), q(6), q(7)] },
            { part_template_id: 4, context: 'Conference agenda', questions: [q(8), q(9), q(10)] },
            { part_template_id: 5, context: null, questions: [q(11)] },
        ],
    };
    const image = { name: 'a.png', mimeType: 'image/png', buffer: png };
    return { payload: JSON.stringify(payload), 'image-0': image, 'image-1': { ...image, name: 'b.png' } };
}

test('AU-S04: Học viên gọi thẳng POST /api/exams với body hợp lệ nhận 403 và không có đề mới trong DB', async ({ page, loginAs, db }) => {
    await loginAs(STUDENT);
    await page.goto('/overview');
    const title = `E2E AU-S04 ${crypto.randomUUID().slice(0, 8)}`;
    const response = await page.request.post('/api/exams', { multipart: validSpeakingExamForm(title) });
    expect(response.status()).toBe(403);
    expect(await must(db.from('exams').select('id').eq('title', title))).toHaveLength(0);
});

test('AU-S05: Đăng ký bằng email đã có tài khoản báo "Email này đã được đăng ký, hãy đăng nhập"', async ({ page }) => {
    await page.goto('/register');
    await fillRegister(page, { email: STUDENT.email, password: 'abcd1234' });
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Email này đã được đăng ký, hãy đăng nhập' })).toBeVisible();
});

test('AU-E07: Họ tên 50 ký tự hợp lệ, 51 ký tự báo lỗi dưới ô họ tên', async ({ page }) => {
    const name = page.getByLabel('Họ và tên');
    await page.goto('/register');
    await fillRegister(page, { name: 'A'.repeat(51) });
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(errorUnder(name)).toBeVisible();
    await expect(page).toHaveURL(/\/register$/);

    await name.fill('A'.repeat(50));
    await name.blur();
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(page).toHaveURL(/\/verify-email/);
});

test('AU-E08: Đăng ký không tích đồng ý điều khoản thì không gửi form và báo lỗi yêu cầu đồng ý', async ({ page }) => {
    const signups = countSignups(page);
    await page.goto('/register');
    await fillRegister(page, { terms: false });
    await page.getByRole('button', { name: 'Tạo tài khoản' }).click();
    await expect(errorUnder(page.getByRole('checkbox'))).toContainText(/điều khoản/i);
    await expect(page).toHaveURL(/\/register$/);
    expect(signups).toHaveLength(0);
});

test('AU-X02: Đăng nhập bằng tài khoản chưa nhập OTP thì gửi lại mã và chuyển sang /verify-email', async ({ page, db }) => {
    const user = await createUser(db, { confirmed: false });
    const resend = page.waitForResponse((response) => response.url().includes('/auth/v1/resend') && response.request().method() === 'POST');
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill(user.email);
    await fillPassword(page.getByLabel('Mật khẩu', { exact: true }), user.password);
    await page.getByRole('button', { name: 'Đăng nhập', exact: true }).click();
    expect((await resend).ok()).toBe(true);
    await expect(page).toHaveURL(/\/verify-email\?email=/);
});

test('AU-E09: Đặt lại mật khẩu bằng chính mật khẩu cũ báo lỗi và mật khẩu không đổi', async ({ page, db }) => {
    const user = await createUser(db);
    await page.goto('/forgot-password');
    await page.waitForLoadState('networkidle');
    await page.getByLabel('Email').fill(user.email);
    await page.getByRole('button', { name: 'Gửi mã đặt lại' }).click();
    await expect(page).toHaveURL(/\/reset-password\?email=/);
    await page.waitForTimeout(1100);
    // Mã OTP lấy bằng admin API (thay cho đọc email)
    const { data, error } = await db.auth.admin.generateLink({ type: 'recovery', email: user.email });
    if (error) throw error;
    await page.getByLabel('Mã xác thực').fill(data.properties.email_otp);
    await fillPassword(page.getByLabel('Mật khẩu mới'), user.password);
    await page.getByRole('button', { name: 'Đặt lại mật khẩu' }).click();
    await expect(page.getByRole('alert').filter({ hasText: /mật khẩu mới phải khác mật khẩu cũ/i })).toBeVisible();
    // Mật khẩu cũ vẫn đăng nhập được
    const check = await db.auth.signInWithPassword({ email: user.email, password: user.password });
    expect(check.error).toBeNull();
});

test('AU-S06: Học viên mở trang sửa đề và trang tạo đề thấy trang 403, không lộ nội dung đề hay form', async ({ page, loginAs }) => {
    await loginAs(STUDENT);
    for (const url of [`/setting/exam-management/${IDS.speaking.draft}/edit`, '/setting/exam-management/new']) {
        await page.goto(url);
        await expect(page.getByText(/không có quyền truy cập/i), url).toBeVisible();
        await expect(page.getByText('E2E Speaking Nháp'), url).toHaveCount(0);
        await expect(page.getByLabel('Tiêu đề'), url).toHaveCount(0);
        await expect(page.locator('form'), url).toHaveCount(0);
    }
});

test('AU-S07: Học viên gọi thẳng API đổi trạng thái và xoá đề đều nhận 403, đề trong DB không đổi', async ({ page, loginAs, db, adminApi }) => {
    const exam = await createExam(adminApi, { skill: 'writing', status: 'draft', title: `E2E AU-S07 ${crypto.randomUUID().slice(0, 8)}` });
    await loginAs(STUDENT);
    await page.goto('/overview');
    const status = await page.request.post(`/api/exams/${exam.id}/status`, { data: { status: 'review' } });
    const remove = await page.request.delete(`/api/exams/${exam.id}`);
    expect.soft(status.status(), 'POST status').toBe(403);
    expect.soft(remove.status(), 'DELETE').toBe(403);
    const rows = await must(db.from('exams').select('status').eq('id', exam.id));
    expect(rows).toEqual([{ status: 'draft' }]);
});
