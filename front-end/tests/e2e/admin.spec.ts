import type { Locator, Page } from '@playwright/test';
import { createExam, createUser, must, type Db } from './seed';
import { ADMIN, expect, insertAttempt, test } from './fixtures';

const unique = (prefix: string) => `E2E ${prefix} ${crypto.randomUUID().slice(0, 8)}`;

/** PNG 1×1 hợp lệ cho ô chọn ảnh. */
const PNG = {
    name: 'e2e.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
        'base64',
    ),
};

const errorUnder = (input: Locator) =>
    input.locator('xpath=ancestor::*[@data-slot="field"][1]').locator('[data-slot=field-error]');

async function openLibrary(page: Page, title?: string) {
    await page.goto('/exam-management');
    await expect(page.getByRole('heading', { name: 'Kho đề thi trong hệ thống' })).toBeVisible();
    if (title) {
        await page.getByLabel('Tìm kiếm đề thi').fill(title);
        await expect(examRow(page, title)).toBeVisible();
    }
}

const examRow = (page: Page, title: string) => page.getByRole('row').filter({ hasText: title });

async function openMenu(page: Page, title: string) {
    await page.getByRole('button', { name: `Thao tác với ${title}` }).click();
    return page.getByRole('menu');
}

const statusOf = async (db: Db, id: string) =>
    (await must(db.from('exams').select('status, review_note').eq('id', id)))[0];

/** Khối "Câu N" của form (fieldset; legend float nên không có tên accessible). */
const question = (page: Page, number: number) =>
    page
        .locator('fieldset')
        .filter({ has: page.locator('xpath=./legend').filter({ hasText: new RegExp(`Câu ${number}$`) }) });
/** Ô nhập theo nhãn; nhãn có dấu `*` aria-hidden nên tìm theo tên accessible. */
const field = (scope: Page | Locator, label: string) => scope.getByRole('textbox', { name: label, exact: true });

async function goToPart(page: Page, partNo: number) {
    await page
        .getByRole('navigation', { name: 'Cấu trúc đề' })
        .getByRole('button', { name: new RegExp(`Part ${partNo}:`) })
        .click();
}

/** Điền form tạo đề Speaking; `skip` liệt kê ô để trống, dạng `"<số câu>:<nhãn>"` hoặc `"part<số Part>:<nhãn>"`. */
async function fillSpeakingExam(page: Page, title: string, skip: string[] = []) {
    const fill = async (scope: Locator, label: string, key: string, value: string) => {
        if (!skip.includes(key)) await field(scope, label).fill(value);
    };
    await field(page, 'Tiêu đề').fill(title);
    await goToPart(page, 1);
    for (const n of [1, 2])
        await fill(
            question(page, n),
            'Đoạn văn cần đọc',
            `${n}:prompt`,
            'Welcome to our store. We are open every day.',
        );
    await goToPart(page, 2);
    for (const n of [3, 4]) {
        await fill(question(page, n), 'Yêu cầu', `${n}:prompt`, 'Describe the picture.');
        await question(page, n).locator('input[type=file]').setInputFiles(PNG);
        await expect(question(page, n).getByRole('img', { name: `Ảnh câu ${n}` })).toBeVisible();
        await fill(question(page, n), 'Mô tả ảnh', `${n}:alt`, 'Two people are talking at a desk.');
    }
    await goToPart(page, 3);
    await fill(
        page.locator('section[aria-labelledby="part-3-title"]'),
        'Tình huống chung',
        'part3:context',
        'A survey about coffee shops.',
    );
    for (const n of [5, 6, 7])
        await fill(question(page, n), 'Câu hỏi', `${n}:prompt`, 'How often do you drink coffee?');
    await goToPart(page, 4);
    await fill(
        page.locator('section[aria-labelledby="part-4-title"]'),
        'Bảng thông tin',
        'part4:context',
        '9:00 Opening\n10:00 Talk',
    );
    for (const n of [8, 9, 10]) await fill(question(page, n), 'Câu hỏi', `${n}:prompt`, 'What time does it start?');
    await goToPart(page, 5);
    await fill(question(page, 11), 'Câu hỏi nêu quan điểm', '11:prompt', 'Do you prefer working from home?');
}

test.beforeEach(async ({ loginAs }) => {
    await loginAs(ADMIN);
});

test('AD-H01: Tạo đề Speaking đủ dữ liệu rồi lưu', async () => {
    test.fixme(
        true,
        'Không tự động hoá được trong môi trường E2E: lưu đề Speaking cần tải ảnh lên R2, nhưng E2E bắt buộc để trống env R2 (AD-X01). Ký hiệu "⚠" trong file cũng chưa được giải thích.',
    );
});

test('AD-C01: Seed đề review thiếu ảnh ở câu 4 (Part 2), bấm phát hành: bị chặn, hộp thoại liệt kê đúng câu đang thiếu', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-C01');
    const exam = await createExam(adminApi, {
        skill: 'speaking',
        status: 'review',
        title,
        omit: { number: 4, field: 'image_path' },
    });
    await openLibrary(page, title);
    await (await openMenu(page, title)).getByRole('menuitem', { name: 'Phát hành' }).click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Phát hành' }).click();
    const issues = dialog.getByRole('alert').getByRole('listitem');
    await expect(issues).toHaveCount(1);
    await expect(issues.first()).toHaveText(/^Câu 4: thiếu /);
    expect((await statusOf(db, exam.id)).status).toBe('review');
});

test('AD-C02: Trả đề về Nháp mà không nhập lý do thì không cho xác nhận; có lý do thì lý do hiện ngay dưới tên đề', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-C02');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'published', title });
    await openLibrary(page, title);
    await (await openMenu(page, title)).getByRole('menuitem', { name: 'Trả về nháp' }).click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Trả về nháp' }).click();
    await expect(dialog).toBeVisible();
    expect((await statusOf(db, exam.id)).status).toBe('published');

    const reason = `Câu 3 thiếu mô tả ảnh ${crypto.randomUUID().slice(0, 4)}`;
    await dialog.getByLabel(/Lý do trả về/).fill(reason);
    await dialog.getByRole('button', { name: 'Trả về nháp' }).click();
    await expect(dialog).toBeHidden();
    // Ô đầu của dòng là tên đề & mã đề: lý do phải nằm ngay dưới tên đề
    await expect(examRow(page, title).getByRole('cell').first()).toContainText(reason);
});

test('AD-C03: Sửa một đề đã có lượt làm: chỉ sửa được thông tin chung; phần các Part bị khoá kèm lời giải thích', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-C03');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'published', title });
    const student = await createUser(db);
    await insertAttempt(db, { user_id: student.id, exam_id: exam.id, part_template_id: 6, score: 100 });
    await page.goto(`/exam-management/${exam.id}/edit`);
    await expect(field(page, 'Tiêu đề')).toBeEditable();
    await expect(page.getByRole('note').filter({ hasText: /khoá|khóa/ })).toBeVisible();
    await expect(field(question(page, 1), 'Mô tả ảnh')).toBeDisabled();
    await expect(field(question(page, 1), 'Từ khoá 1')).toBeDisabled();
});

test('AD-E01: Chọn ảnh PNG đúng 10 MB, 10 MB + 1 byte và GIF ở form tạo đề', async () => {
    test.fixme(
        true,
        'Mơ hồ: "10 MB" chưa rõ là 10 × 1024 × 1024 byte hay 10.000.000 byte, nên không xác định được file "10 MB + 1 byte" (oracle business.upload không còn trong repo).',
    );
});

test('AD-E02: Writing câu 1 nhập 1 từ khoá, rồi 3 từ khoá', async () => {
    test.fixme(
        true,
        'Không tự động hoá được như mô tả: form chỉ có đúng 2 ô từ khoá cố định, không có cách nhập từ khoá thứ 3.',
    );
});

test('AD-H02: Xoá một đề chưa có lượt làm: có hộp thoại xác nhận, xác nhận xong đề biến mất khỏi kho đề', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-H02');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'draft', title });
    await openLibrary(page, title);
    await page.getByRole('button', { name: `Xóa ${title}` }).click();
    const dialog = page.getByRole('alertdialog', { name: /Xóa đề thi/ });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', { name: 'Xóa đề thi' }).click();
    await expect(examRow(page, title)).toHaveCount(0);
    await expect.poll(async () => (await must(db.from('exams').select('id').eq('id', exam.id))).length).toBe(0);
});

test('AD-C04: Đề Nháp: menu không có "Phát hành"; gọi thẳng API phát hành bị từ chối, trạng thái vẫn là Nháp', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-C04');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'draft', title });
    await openLibrary(page, title);
    const menu = await openMenu(page, title);
    await expect(menu.getByRole('menuitem').first()).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: 'Phát hành' })).toHaveCount(0);
    await page.keyboard.press('Escape');

    const response = await page.request.post(`/api/exams/${exam.id}/status`, { data: { status: 'published' } });
    expect(response.ok()).toBe(false);
    expect((await statusOf(db, exam.id)).status).toBe('draft');
});

test('AD-E03: Đề bị trả về nháp có lý do, gửi thẩm định lại: lý do cũ không còn hiện dưới tên đề', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-E03');
    const reason = `Lý do cũ ${crypto.randomUUID().slice(0, 6)}`;
    const exam = await createExam(adminApi, { skill: 'writing', status: 'draft', title });
    await must(db.from('exams').update({ review_note: reason }).eq('id', exam.id));
    await openLibrary(page, title);
    await expect(examRow(page, title), 'tiền điều kiện').toContainText(reason);

    await (await openMenu(page, title)).getByRole('menuitem', { name: 'Gửi thẩm định' }).click();
    const dialog = page.getByRole('alertdialog');
    await dialog.getByRole('button', { name: 'Gửi thẩm định' }).click();
    await expect(dialog).toBeHidden();
    await expect(examRow(page, title)).not.toContainText(reason);
    await openLibrary(page, title);
    await expect(examRow(page, title)).not.toContainText(reason);
});

test('AD-E04: Mở /exam-management/<id không tồn tại>/edit hiện "Không tìm thấy đề" kèm link về kho đề', async ({
    page,
}) => {
    await page.goto(`/exam-management/${crypto.randomUUID()}/edit`);
    await expect(page.getByRole('heading', { name: /Không tìm thấy đề/ })).toBeVisible();
    await expect(page.getByRole('main').getByRole('link', { name: /kho đề/i })).toHaveAttribute(
        'href',
        '/exam-management',
    );
});

test('AD-C05: Trả một đề Đang khả dụng (đã có lượt làm) về nháp: hộp thoại cảnh báo số lượt làm bị ảnh hưởng', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-C05');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'published', title });
    const student = await createUser(db);
    for (const part of [6, 7, 8])
        await insertAttempt(db, { user_id: student.id, exam_id: exam.id, part_template_id: part, score: 100 });
    await openLibrary(page, title);
    await (await openMenu(page, title)).getByRole('menuitem', { name: 'Trả về nháp' }).click();
    await expect(page.getByRole('alertdialog').getByText(/3 lượt làm/)).toBeVisible();
});

test('AD-E05: Writing câu 1: mô tả ảnh 1.000 ký tự hợp lệ; 1.001 ký tự báo lỗi dưới ô', async ({ page }) => {
    await page.goto('/exam-management/new?skill=writing');
    const alt = field(question(page, 1), 'Mô tả ảnh');
    await alt.fill('a'.repeat(1001));
    await page.getByRole('button', { name: 'Lưu nháp' }).click();
    await goToPart(page, 1);
    await expect(errorUnder(alt)).toBeVisible();
    await alt.fill('a'.repeat(1000));
    await page.getByRole('button', { name: 'Lưu nháp' }).click();
    await goToPart(page, 1);
    await expect(errorUnder(alt)).toHaveCount(0);
});

test('AD-E06: Writing câu 6 bỏ trống email: báo lỗi, không lưu được', async ({ page }) => {
    const posts: string[] = [];
    page.on(
        'request',
        (request) => request.url().includes('/api/exams') && request.method() === 'POST' && posts.push(request.url()),
    );
    await page.goto('/exam-management/new?skill=writing');
    await page.getByRole('button', { name: 'Lưu nháp' }).click();
    await goToPart(page, 2);
    await expect(errorUnder(field(question(page, 6), 'Email'))).toBeVisible();
    await expect(page).toHaveURL(/\/exam-management\/new/);
    expect(posts).toEqual([]);
});

test('AD-H03: Kho đề bấm "Tạo đề Writing" mở /exam-management/new?skill=writing, form có đủ 8 câu rỗng theo 3 Part', async ({
    page,
}) => {
    await openLibrary(page);
    await page.getByRole('link', { name: 'Tạo đề Writing' }).click();
    await expect(page).toHaveURL(/\/exam-management\/new\?skill=writing$/);
    await expect(page.getByRole('navigation', { name: 'Cấu trúc đề' }).getByRole('button')).toHaveCount(3);
    await expect(field(page, 'Tiêu đề')).toBeVisible();
    const questions = await page.locator('fieldset').evaluateAll((items) =>
        items
            .filter((item) => /^\d+Câu \d+$/.test(item.querySelector(':scope > legend')?.textContent?.trim() ?? ''))
            .map((item) => ({
                legend: item.querySelector(':scope > legend')!.textContent!.trim(),
                values: [...item.querySelectorAll('input:not([type=file]), textarea')].map(
                    (input) => (input as HTMLInputElement).value,
                ),
            })),
    );
    expect(questions.map((q) => q.legend.replace(/^\d+/, ''))).toEqual([1, 2, 3, 4, 5, 6, 7, 8].map((n) => `Câu ${n}`));
    for (const q of questions)
        expect(
            q.values.every((value) => value === ''),
            q.legend,
        ).toBe(true);
});

test('AD-E07: Bấm lưu khi Part 2 có 2 ô lỗi, Part 4 có 1 ô lỗi: lỗi hiện dưới từng ô; badge Part 2 là 2, Part 4 là 1', async ({
    page,
}) => {
    await page.goto('/exam-management/new');
    await fillSpeakingExam(page, unique('AD-E07'), ['3:prompt', '4:prompt', 'part4:context']);
    await page.getByRole('button', { name: 'Lưu nháp' }).click();

    await goToPart(page, 2);
    await expect(page.locator('section[aria-labelledby="part-2-title"]').getByText(/^\d+ lỗi$/)).toHaveText('2 lỗi');
    for (const n of [3, 4]) await expect(errorUnder(field(question(page, n), 'Yêu cầu'))).toBeVisible();

    await goToPart(page, 4);
    const part4 = page.locator('section[aria-labelledby="part-4-title"]');
    await expect(part4.getByText(/^\d+ lỗi$/)).toHaveText('1 lỗi');
    await expect(errorUnder(field(part4, 'Bảng thông tin'))).toBeVisible();
});

test('AD-E08: Xoá đề đã có lượt làm: API trả 409, UI báo rõ đề đã có lượt làm nên không thể xoá, đề vẫn còn', async ({
    page,
    adminApi,
    db,
}) => {
    const title = unique('AD-E08');
    const exam = await createExam(adminApi, { skill: 'writing', status: 'published', title });
    const student = await createUser(db);
    await insertAttempt(db, { user_id: student.id, exam_id: exam.id, part_template_id: 6, score: 100 });
    await openLibrary(page, title);
    await page.getByRole('button', { name: `Xóa ${title}` }).click();
    const deleted = page.waitForResponse(
        (response) => response.url().includes(`/api/exams/${exam.id}`) && response.request().method() === 'DELETE',
    );
    await page.getByRole('alertdialog').getByRole('button', { name: 'Xóa đề thi' }).click();
    expect((await deleted).status()).toBe(409);
    const notice = page.getByRole('status').filter({ hasText: /lượt (thi|làm)/ });
    await expect(notice).toContainText(/không thể (xóa|xoá)/i);
    await expect(examRow(page, title)).toBeVisible();
    expect(await must(db.from('exams').select('id').eq('id', exam.id))).toHaveLength(1);
});
