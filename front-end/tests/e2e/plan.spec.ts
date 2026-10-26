import type { Locator, Page } from '@playwright/test';
import { must, type Db } from './seed';
import {
    answerAllGuided,
    answerPart,
    dayKey,
    expect,
    IDS,
    insertAttempt,
    MISTAKE,
    mockSpeakingScore,
    mockWritingScore,
    openSpeakingRoom,
    openWritingRoom,
    questionNumbers,
    speakingResult,
    submitButton,
    submitPart,
    test,
} from './fixtures';

type TaskSeed = {
    kind: 'speaking' | 'writing' | 'review' | 'mock' | 'summary';
    title: string;
    exam_id?: string | null;
    mistake_pattern_id?: string | null;
    attempt_id?: string | null;
    completed_at?: string | null;
    scheduled_date?: string;
};

/** Mục tiêu + lộ trình active có sẵn (bỏ qua bước sinh lộ trình). */
async function seedPlan(db: Db, userId: string, tasks: TaskSeed[]) {
    await must(db.from('profiles').update({ target_speaking: 150, target_writing: 150, exam_date: dayKey(56) }).eq('id', userId));
    const [plan] = await must(
        db
            .from('study_plans')
            .insert({ user_id: userId, minutes_per_day: 45, days_per_week: 5, ai_rationale: 'Lộ trình seed E2E' })
            .select('id'),
    );
    await must(db.from('study_plan_weeks').insert({ plan_id: plan.id, week_no: 1, theme: 'Tuần seed' }));
    await must(
        db.from('plan_tasks').insert(
            tasks.map((task, index) => ({
                plan_id: plan.id,
                scheduled_date: dayKey(),
                sort_order: index,
                duration_min: 30,
                ...task,
            })),
        ),
    );
    return plan.id;
}

const activePlans = async (db: Db, userId: string) =>
    must(db.from('study_plans').select('id').eq('user_id', userId).eq('status', 'active'));

const goalsDialog = (page: Page) => page.getByRole('dialog', { name: 'Mục tiêu & Lịch thi' });

async function openGoals(page: Page) {
    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Mục tiêu & Lịch thi' }).click();
    await expect(goalsDialog(page)).toBeVisible();
    return goalsDialog(page);
}

/** Giá trị đang chọn của một Select (trigger còn có icon mũi tên). */
const selected = (dialog: Locator, label: string) => dialog.getByLabel(label).locator('[data-slot=select-value]');

async function choose(page: Page, dialog: Locator, label: string, option: string) {
    await dialog.getByLabel(label).click();
    await page.getByRole('option', { name: option, exact: true }).click();
    await expect(selected(dialog, label)).toHaveText(option);
}

async function optionsOf(page: Page, dialog: Locator, label: string) {
    await dialog.getByLabel(label).click();
    const listbox = page.getByRole('listbox');
    await expect(listbox.getByRole('option').first()).toBeVisible();
    const options = await listbox.getByRole('option').allInnerTexts();
    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
    return options.map((text) => text.trim());
}

const saveButton = (dialog: Locator) => dialog.page().getByRole('button', { name: /^Lưu & tạo/ });
const weeklyTable = (page: Page) => page.locator('section[aria-labelledby="weekly-task-title"]');

test('PL-H01: Học viên chưa có điểm cả đề đặt mục tiêu Speaking 150, Writing 150, thi sau 8 tuần, 5 ngày/tuần, 45 phút: lộ trình tạo ngay, tuần 1 có thi thử mỗi kỹ năng', async ({ page, freshStudent }) => {
    await freshStudent();
    const dialog = await openGoals(page);
    await choose(page, dialog, 'Mục tiêu Speaking', '150 điểm');
    await choose(page, dialog, 'Mục tiêu Writing', '150 điểm');
    await dialog.getByLabel('Ngày thi').fill(dayKey(56));
    await choose(page, dialog, 'Số buổi học', '5 buổi/tuần');
    await choose(page, dialog, 'Thời lượng mỗi buổi', '45 phút');
    await saveButton(dialog).click();
    await expect(dialog).toBeHidden();
    await expect(weeklyTable(page)).toBeVisible();
    await expect(weeklyTable(page).getByText('Thi thử Speaking').first()).toBeVisible();
    await expect(weeklyTable(page).getByText('Thi thử Writing').first()).toBeVisible();
});

test('PL-E01: Ngày thi là hôm nay thì không lưu được, có báo lỗi', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const dialog = await openGoals(page);
    await choose(page, dialog, 'Mục tiêu Speaking', '150 điểm');
    await dialog.getByLabel('Ngày thi').fill(dayKey(0));
    await saveButton(dialog).click();
    await expect(dialog.locator('[data-slot=field-error]').first()).toBeVisible();
    await expect(dialog).toBeVisible();
    expect(await activePlans(db, user.id)).toEqual([]);
});

test('PL-E02: Ngày thi là ngày mai: lộ trình chỉ có task hôm nay, không có task nào từ ngày thi trở đi', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const dialog = await openGoals(page);
    await choose(page, dialog, 'Mục tiêu Speaking', '150 điểm');
    await dialog.getByLabel('Ngày thi').fill(dayKey(1));
    await saveButton(dialog).click();
    await expect(dialog).toBeHidden();
    const [plan] = await activePlans(db, user.id);
    const tasks = await must(db.from('plan_tasks').select('scheduled_date').eq('plan_id', plan.id));
    expect(tasks.length).toBeGreaterThan(0);
    for (const task of tasks) expect(task.scheduled_date).toBe(dayKey(0));
});

test('PL-E03: Ngày thi sau 6 tháng: lộ trình dài tối đa 12 tuần', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const dialog = await openGoals(page);
    await choose(page, dialog, 'Mục tiêu Writing', '150 điểm');
    await dialog.getByLabel('Ngày thi').fill(dayKey(183));
    await saveButton(dialog).click();
    await expect(dialog).toBeHidden();
    const [plan] = await activePlans(db, user.id);
    const weeks = await must(db.from('study_plan_weeks').select('week_no').eq('plan_id', plan.id));
    expect(weeks.length).toBeGreaterThan(0);
    expect(Math.max(...weeks.map((week) => week.week_no))).toBeLessThanOrEqual(12);
    const tasks = await must(db.from('plan_tasks').select('scheduled_date').eq('plan_id', plan.id));
    // 12 tuần tính từ tuần chứa hôm nay
    for (const task of tasks) expect(task.scheduled_date < dayKey(84)).toBe(true);
});



test('PL-C01: Bấm "Tạo lại lộ trình" và xác nhận: có hộp thoại xác nhận, lộ trình mới thay lộ trình cũ, task đã làm vẫn còn trong lịch sử', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const attemptId = await insertAttempt(db, { user_id: user.id, exam_id: IDS.speaking.published[0], score: 140 });
    const oldPlan = await seedPlan(db, user.id, [
        { kind: 'mock', title: 'Thi thử: E2E Speaking 1', exam_id: IDS.speaking.published[0], attempt_id: attemptId },
        { kind: 'review', title: 'Ôn lỗi', mistake_pattern_id: MISTAKE.essayOpinion },
    ]);
    await page.goto('/schedule');
    await page.getByRole('button', { name: 'Tạo lại lộ trình' }).click();
    const confirm = page.getByRole('alertdialog', { name: 'Tạo lại lộ trình?' });
    await expect(confirm).toBeVisible();
    await confirm.getByRole('button', { name: 'Tạo lại' }).click();
    await expect(confirm).toBeHidden();

    const active = await activePlans(db, user.id);
    expect(active).toHaveLength(1);
    expect(active[0].id).not.toBe(oldPlan);
    await page.goto('/setting/history');
    await expect(page.getByRole('row').filter({ hasText: `#${attemptId.slice(0, 8).toUpperCase()}` })).toBeVisible();
});

test('PL-C02: Có task thi thử Writing, nộp xong Part 1: task chưa xong; chỉ xong khi nộp đủ 3 Part', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const exam = IDS.writing.published[0];
    const plan = await seedPlan(db, user.id, [{ kind: 'mock', title: 'Thi thử: E2E Writing 1', exam_id: exam }]);
    await mockWritingScore(page, () => ({ status: 200, body: { status: 'submitted' } }));
    const task = async () => (await must(db.from('plan_tasks').select('attempt_id, completed_at').eq('plan_id', plan)))[0];

    await openWritingRoom(page, exam);
    await answerPart(page, Array(5).fill('People are waiting for the bus.'));
    await submitPart(page);
    await expect(submitButton(page, 'Câu 6–7')).toBeVisible();
    await page.waitForTimeout(2500);
    expect(await task(), 'sau Part 1').toEqual({ attempt_id: null, completed_at: null });

    await answerPart(page, ['Could you send the items next week?', 'I suggest a discount.']);
    await submitPart(page);
    await expect(submitButton(page, 'Câu 8')).toBeVisible();
    await answerPart(page, ['Large companies offer better training.']);
    await submitPart(page);
    await expect(page).toHaveURL(/\/setting\/history\//);
    await expect.poll(async () => (await task()).attempt_id ?? (await task()).completed_at).not.toBeNull();
});

test('PL-H02: Task ôn lỗi: bấm "Đánh dấu xong" thì task chuyển sang xong và tiến độ tuần tăng tương ứng', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    await seedPlan(db, user.id, [
        { kind: 'review', title: 'Ôn lỗi E2E', mistake_pattern_id: MISTAKE.essayOpinion },
        { kind: 'mock', title: 'Thi thử: E2E Speaking 2', exam_id: IDS.speaking.published[1] },
    ]);
    await page.goto('/schedule');
    const progress = page.locator('section[aria-labelledby="week-sprint-title"]');
    await expect(progress).toContainText('Hoàn thành 0/2 bài');
    const row = weeklyTable(page).getByRole('row').filter({ hasText: 'Ôn tập Sổ lỗi' });
    await row.getByRole('button', { name: 'Đánh dấu xong' }).click();
    await expect(row).toContainText('Hoàn thành');
    await expect(progress).toContainText('Hoàn thành 1/2 bài');
});

test('PL-E05: Mở form "Mục tiêu & Lịch thi" lần đầu: số ngày học/tuần 3–7 mặc định 5; thời lượng 30/45/60 mặc định 45', async ({ page, freshStudent }) => {
    await freshStudent();
    const dialog = await openGoals(page);
    await expect(selected(dialog, 'Số buổi học')).toHaveText('5 buổi/tuần');
    await expect(selected(dialog, 'Thời lượng mỗi buổi')).toHaveText('45 phút');
    expect(await optionsOf(page, dialog, 'Số buổi học')).toEqual([3, 4, 5, 6, 7].map((n) => `${n} buổi/tuần`));
    expect(await optionsOf(page, dialog, 'Thời lượng mỗi buổi')).toEqual(['30 phút', '45 phút', '60 phút']);
});

test('PL-X01: Lưu form khi request tạo lộ trình lỗi: báo lỗi trong hộp thoại, giữ dữ liệu đã nhập, lộ trình cũ không đổi', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const oldPlan = await seedPlan(db, user.id, [{ kind: 'review', title: 'Ôn lỗi', mistake_pattern_id: MISTAKE.essayOpinion }]);
    await page.route('**/rest/v1/rpc/create_study_plan', (route) => route.abort('internetdisconnected'));
    const dialog = await openGoals(page);
    await choose(page, dialog, 'Mục tiêu Speaking', '180 điểm');
    await dialog.getByLabel('Ngày thi').fill(dayKey(40));
    await saveButton(dialog).click();
    await expect(dialog.getByRole('alert')).toBeVisible();
    await expect(selected(dialog, 'Mục tiêu Speaking')).toHaveText('180 điểm');
    await expect(dialog.getByLabel('Ngày thi')).toHaveValue(dayKey(40));
    expect((await activePlans(db, user.id)).map((plan) => plan.id)).toEqual([oldPlan]);
});

test('PL-H03: Có task thi thử Speaking gắn một đề; làm và nộp đề đó thì task tự chuyển sang xong', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const exam = IDS.speaking.published[3];
    const plan = await seedPlan(db, user.id, [{ kind: 'mock', title: 'Thi thử: E2E Speaking 4', exam_id: exam }]);
    const numberOf = await questionNumbers(db, exam);
    await mockSpeakingScore(page, ({ questionId }) => ({ status: 200, body: speakingResult(2, numberOf[questionId] === 11 ? 5 : 3) }), db);
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    await expect(page).toHaveURL(/\/setting\/history\//);

    await expect.poll(async () => (await must(db.from('plan_tasks').select('attempt_id').eq('plan_id', plan)))[0].attempt_id).not.toBeNull();
    await page.goto('/schedule');
    await expect(weeklyTable(page).getByRole('row').filter({ hasText: 'Thi thử Speaking' })).toContainText('Hoàn thành');
});

test('PL-E06: Để trống cả hai điểm mục tiêu rồi lưu: không lưu được, báo "Đặt mục tiêu cho ít nhất một kỹ năng"', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const dialog = await openGoals(page);
    await choose(page, dialog, 'Mục tiêu Speaking', 'Không luyện');
    await choose(page, dialog, 'Mục tiêu Writing', 'Không luyện');
    await dialog.getByLabel('Ngày thi').fill(dayKey(30));
    await saveButton(dialog).click();
    await expect(dialog.getByText('Đặt mục tiêu cho ít nhất một kỹ năng')).toBeVisible();
    expect(await activePlans(db, user.id)).toEqual([]);
});

test('PL-C03: Đã có lộ trình, mở form mục tiêu, đổi điểm và lưu: form có cảnh báo trước khi lưu; lưu xong lộ trình được sinh lại theo mục tiêu mới', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const oldPlan = await seedPlan(db, user.id, [{ kind: 'review', title: 'Ôn lỗi', mistake_pattern_id: MISTAKE.essayOpinion }]);
    const dialog = await openGoals(page);
    await expect(dialog.getByText(/tạo lại lộ trình/i).first()).toBeVisible();
    await choose(page, dialog, 'Mục tiêu Speaking', '180 điểm');
    await saveButton(dialog).click();
    await expect(dialog).toBeHidden();

    const [profile] = await must(db.from('profiles').select('target_speaking').eq('id', user.id));
    expect(profile.target_speaking).toBe(180);
    const active = await activePlans(db, user.id);
    expect(active).toHaveLength(1);
    expect(active[0].id).not.toBe(oldPlan);
});
