import type { Page } from '@playwright/test';
import { must } from './seed';
import {
    answerAllGuided,
    denyMicrophone,
    expect,
    IDS,
    insertAttempt,
    insertResponse,
    localTable,
    mockSpeakingScore,
    openSpeakingRoom,
    questionIds,
    questionNumbers,
    reviewScore,
    speakingResult,
    STUDENT,
    ADMIN,
    test,
    tickSeconds,
} from './fixtures';
import type { Db } from './seed';

const PHASE_TITLE = {
    prep: 'Thời gian chuẩn bị còn lại',
    speak: 'Thời gian trả lời còn lại',
    done: 'Đã chốt bài nói',
} as const;

const mmss = (seconds: number) =>
    `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
const phase = (page: Page, name: keyof typeof PHASE_TITLE) =>
    page.getByText(PHASE_TITLE[name], { exact: true }).first();

/** Giai đoạn `name` kéo dài đúng `seconds`: bắt đầu ở mm:ss, sau seconds-1 giây vẫn ở giai đoạn đó, giây tiếp theo thì chuyển. */
async function expectPhaseLasts(page: Page, name: 'prep' | 'speak', seconds: number) {
    await expect(phase(page, name)).toBeVisible();
    await expect(page.getByRole('timer')).toHaveText(mmss(seconds));
    await tickSeconds(page, seconds - 1);
    await expect(phase(page, name)).toBeVisible();
    await expect(page.getByRole('timer')).toHaveText('00:01');
    await tickSeconds(page, 1);
    await expect(phase(page, name)).toBeHidden();
}

/** Tua tới khi vào giai đoạn trả lời; trả về số giây đã tua. */
async function tickUntilSpeak(page: Page, max = 120) {
    for (let elapsed = 0; elapsed <= max; elapsed++) {
        if (await phase(page, 'speak').isVisible()) return elapsed;
        await tickSeconds(page, 1);
    }
    throw new Error('Không vào giai đoạn trả lời');
}

/** Lượt CBT đang dở của học viên, đã chấm sẵn các câu 1..`answered` → phòng thi mở ở câu `answered + 1`. */
async function resumeAt(db: Db, userId: string, examId: string, answered: number) {
    const ids = await questionIds(db, examId);
    const attemptId = await insertAttempt(db, { user_id: userId, exam_id: examId, status: 'in_progress', mode: 'cbt' });
    for (let number = 1; number <= answered; number++) {
        await insertResponse(db, {
            attempt_id: attemptId,
            question_id: ids[number],
            score: 2,
            max_score: number === 11 ? 5 : 3,
        });
    }
    return attemptId;
}

const ok = (numberOf: Record<string, number>) => (questionId: string) => ({
    status: 200,
    body: speakingResult(2, numberOf[questionId] === 11 ? 5 : 3),
});

test('SP-H01: CBT câu 1: chuẩn bị đúng 45s, trả lời đúng 45s, sau đó ở trạng thái "Đã chốt"', async ({ page, db }) => {
    test.setTimeout(400_000);
    const exam = IDS.speaking.published[0];
    const numberOf = await questionNumbers(db, exam);
    await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId));
    await openSpeakingRoom(page, exam, undefined, { freeze: true });
    await expect(page.getByText('Đang làm câu 1')).toBeVisible();
    await expectPhaseLasts(page, 'prep', 45);
    await expectPhaseLasts(page, 'speak', 45);
    await expect(phase(page, 'done')).toBeVisible();
});

test('SP-C01: CBT: không chuyển được câu khi đang chuẩn bị và khi đang trả lời', async ({ page, db }) => {
    const exam = IDS.speaking.published[1];
    const numberOf = await questionNumbers(db, exam);
    await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId));
    await openSpeakingRoom(page, exam, undefined, { freeze: true });
    const next = page.getByRole('button', { name: 'Tiếp tục' });
    await expect(phase(page, 'prep')).toBeVisible();
    await expect(next).toBeDisabled();
    await tickUntilSpeak(page);
    await expect(next).toBeDisabled();
});

test('SP-C02: CBT Part 3 (câu 5, 6, 7): chuẩn bị 3s; trả lời lần lượt 15s, 15s, 30s', async ({
    page,
    db,
    freshStudent,
}) => {
    test.setTimeout(400_000);
    const user = await freshStudent();
    const exam = IDS.speaking.published[4];
    const numberOf = await questionNumbers(db, exam);
    await resumeAt(db, user.id, exam, 4);
    await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId), db);
    await openSpeakingRoom(page, exam, undefined, { freeze: true });
    for (const [number, speak] of [
        [5, 15],
        [6, 15],
        [7, 30],
    ]) {
        await expect(page.getByText(`Đang làm câu ${number}`)).toBeVisible();
        await expectPhaseLasts(page, 'prep', 3);
        await expectPhaseLasts(page, 'speak', speak);
        await page.getByRole('button', { name: 'Tiếp tục' }).click();
    }
});

test('SP-C03: CBT Part 4: có 45s đọc thông tin trước câu 8; câu 8–10 trả lời 15s, 15s, 30s', async ({
    page,
    db,
    freshStudent,
}) => {
    test.setTimeout(400_000);
    const user = await freshStudent();
    const exam = IDS.speaking.published[5];
    const numberOf = await questionNumbers(db, exam);
    await resumeAt(db, user.id, exam, 7);
    await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId), db);
    await openSpeakingRoom(page, exam, undefined, { freeze: true });
    await expect(page.getByText('Đang làm câu 8')).toBeVisible();
    // Bắt đầu câu 8 là 45s đọc thông tin, chưa ghi âm
    await expect.soft(page.getByRole('timer'), 'đồng hồ đọc thông tin trước câu 8').toHaveText('00:45');
    const beforeSpeak = await tickUntilSpeak(page);
    expect.soft(beforeSpeak, 'số giây trước khi được trả lời câu 8').toBeGreaterThanOrEqual(45);
    for (const [number, speak] of [
        [8, 15],
        [9, 15],
        [10, 30],
    ]) {
        if (number > 8) {
            await page.getByRole('button', { name: 'Tiếp tục' }).click();
            await expect(page.getByText(`Đang làm câu ${number}`)).toBeVisible();
            await tickUntilSpeak(page);
        }
        await expectPhaseLasts(page, 'speak', speak);
    }
});

test('SP-C04: CBT Part 2 chuẩn bị 45s, trả lời 30s; Part 5 chuẩn bị 45s, trả lời 60s', async ({
    page,
    db,
    freshStudent,
}) => {
    test.setTimeout(400_000);
    const user = await freshStudent();
    const part2Exam = IDS.speaking.published[2];
    const part5Exam = IDS.speaking.published[3];
    const numbers = { ...(await questionNumbers(db, part2Exam)), ...(await questionNumbers(db, part5Exam)) };
    await resumeAt(db, user.id, part2Exam, 2);
    await resumeAt(db, user.id, part5Exam, 10);
    await mockSpeakingScore(page, ({ questionId }) => ok(numbers)(questionId), db);
    await openSpeakingRoom(page, part2Exam, undefined, { freeze: true });
    await expect(page.getByText('Đang làm câu 3')).toBeVisible();
    await expectPhaseLasts(page, 'prep', 45);
    await expectPhaseLasts(page, 'speak', 30);

    await openSpeakingRoom(page, part5Exam, undefined, { freeze: true });
    await expect(page.getByText('Đang làm câu 11')).toBeVisible();
    await expectPhaseLasts(page, 'prep', 45);
    await expectPhaseLasts(page, 'speak', 60);
});

test('SP-H02: mode=guided: bỏ qua được phần chuẩn bị; chuyển câu lúc nào cũng được', async ({ page, db }) => {
    const exam = IDS.speaking.published[1];
    const numberOf = await questionNumbers(db, exam);
    await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId));
    await openSpeakingRoom(page, exam, 'guided');
    const next = page.getByRole('button', { name: 'Tiếp tục' });
    // Đang chuẩn bị vẫn chuyển câu được
    await expect(phase(page, 'prep')).toBeVisible();
    await expect(next).toBeEnabled();
    await page.getByRole('button', { name: 'Bỏ qua chuẩn bị, nói ngay' }).click();
    await expect(phase(page, 'speak')).toBeVisible();
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByText('Đang làm câu 2')).toBeVisible();
    await expect(next).toBeEnabled();
    await next.click();
    await expect(page.getByText('Đang làm câu 3')).toBeVisible();
});

test('SP-C05: Làm tới câu 4, thoát bài thi và mở lại đề: hộp thoại có tên đề và câu hiện tại, lượt chuyển interrupted, mở lại làm tiếp', async ({
    page,
    db,
    freshStudent,
}) => {
    const user = await freshStudent();
    const exam = IDS.speaking.published[2];
    const numberOf = await questionNumbers(db, exam);
    const calls = await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId), db);
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page, 3);
    await expect(page.getByText('Đang làm câu 4')).toBeVisible();
    await expect.poll(() => calls.length).toBe(3);

    await page.getByRole('button', { name: 'Thoát bài thi' }).click();
    const dialog = page.getByRole('dialog', { name: 'Thoát phòng thi?' });
    await expect(dialog).toContainText('E2E Speaking 3');
    await expect(dialog).toContainText(/Câu 4\b/);
    await dialog.getByRole('button', { name: 'Xác nhận thoát' }).click();
    await expect(page).toHaveURL(/\/speaking$/);
    await expect
        .poll(async () =>
            (await must(db.from('attempts').select('status').eq('user_id', user.id).eq('exam_id', exam))).map(
                (a) => a.status,
            ),
        )
        .toEqual(['interrupted']);

    await openSpeakingRoom(page, exam, 'guided');
    await expect(page.getByText('Đang làm câu 4')).toBeVisible();
});

test('SP-X01: Mic bị từ chối quyền: đồng hồ dừng, có hướng dẫn cấp quyền mic', async ({ page }) => {
    await denyMicrophone(page, 'NotAllowedError');
    await page.goto(`/speaking/test?id=${IDS.speaking.published[0]}`);
    await page.getByRole('button', { name: 'Bật micro' }).click();
    const alert = page.getByRole('alert').filter({ hasText: /micro/i });
    await expect(alert).toBeVisible();
    await expect(alert).toContainText(/cho phép/i);
    const before = await page.getByRole('timer').textContent();
    await page.waitForTimeout(2500);
    await expect(page.getByRole('timer')).toHaveText(before ?? '');
});

test('SP-X02: API chấm trả 500 cho một câu: bấm Kết thúc thì câu lỗi được gửi chấm lại 1 lần, vẫn lỗi thì báo lỗi và cho thử lại', async ({
    page,
    db,
}) => {
    const exam = IDS.speaking.published[3];
    const numberOf = await questionNumbers(db, exam);
    const failing = (await questionIds(db, exam))[5];
    const calls = await mockSpeakingScore(page, ({ questionId }) =>
        questionId === failing ? { status: 500, body: { error: 'server_error' } } : ok(numberOf)(questionId),
    );
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    await expect(page.getByRole('alert').filter({ hasText: /Chưa chấm xong/ })).toBeVisible();
    expect(calls.filter((call) => call.questionId === failing)).toHaveLength(2);
    await expect(page.getByRole('button', { name: 'Kết thúc' })).toBeEnabled();
});

test('SP-X03: API chấm trả 429 giữa bài: vẫn nộp được, câu chưa chấm tính 0 và có ghi lỗi, hiện "Hết lượt chấm hôm nay"', async ({
    page,
    db,
}) => {
    const exam = IDS.speaking.published[4];
    const numberOf = await questionNumbers(db, exam);
    const limited = (await questionIds(db, exam))[6];
    await mockSpeakingScore(page, ({ questionId }) => {
        if (questionId === limited) return { status: 429, body: { error: 'daily_limit' } };
        const max = numberOf[questionId] === 11 ? 5 : 3;
        return { status: 200, body: speakingResult(max, max) };
    });
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    await expect(page).toHaveURL(/\/setting\/history\/[0-9a-f-]{36}/);
    await expect.soft(page.getByText(/Hết lượt chấm hôm nay/i).first()).toBeVisible();
    // Mọi câu khác đạt tối đa, câu 6 tính 0: 32/35 quy tuyến tính về 0–200, làm tròn bội số 10 = 180
    await expect.soft(reviewScore(page)).toHaveText('180');
    const attempt = (await localTable<{ exam_id: string; scoring_error: string | null }>(page, 'attempts')).find(
        (a) => a.exam_id === exam,
    );
    expect(attempt?.scoring_error).toBeTruthy();
});

test('SP-S01: Mở phòng thi hiện thông báo quyền riêng tư: Part 1 gửi Azure, Part 2–5 gửi Groq, hệ thống không lưu bản ghi', async ({
    page,
}) => {
    await page.goto(`/speaking/test?id=${IDS.speaking.published[0]}`);
    const note = page.getByRole('note').filter({ hasText: /Azure/ });
    await expect(note).toBeVisible();
    await expect(note).toContainText(/Part 1[^.]*Azure/);
    await expect(note).toContainText(/Part 2[–-]5[^.]*Groq/);
    await expect(note).toContainText(/chuyển thành chữ/);
    await expect(note).toContainText(/không (được )?lưu/);
});

test('SP-S02: Học viên mở /speaking/test?id=<đề draft> nhận 404, không hiện nội dung đề', async ({ page, loginAs }) => {
    await loginAs(STUDENT);
    const response = await page.goto(`/speaking/test?id=${IDS.speaking.draft}`);
    await expect(page.getByText('Không tìm thấy trang')).toBeVisible();
    await expect(page.getByText('E2E Speaking Nháp')).toHaveCount(0);
    await expect(page.getByText('Thank you for calling Greenfield Bank')).toHaveCount(0);
    expect(response?.status()).toBe(404);
});

test('SP-H03: Admin mở đề draft bằng nút xem trước thì xem được nội dung đề', async ({ page, loginAs }) => {
    await loginAs(ADMIN);
    await page.goto('/exam-management');
    await page.getByRole('link', { name: 'Xem trước phòng thi E2E Speaking Nháp' }).click();
    await expect(page).toHaveURL(new RegExp(`/speaking/test\\?id=${IDS.speaking.draft}`));
    await expect(page.getByRole('heading', { name: 'E2E Speaking Nháp' })).toBeVisible();
    await expect(page.getByText('Thank you for calling Greenfield Bank').first()).toBeVisible();
});

test('SP-E01: mode=abc hoặc không có tham số mode thì tự dùng cbt; trang không vỡ', async ({ page }) => {
    for (const [exam, query] of [
        [IDS.speaking.published[0], '&mode=abc'],
        [IDS.speaking.published[1], ''],
    ]) {
        await page.goto(`/speaking/test?id=${exam}${query}`);
        await expect(page.getByText('Chế độ: Thi thử chuẩn'), query || 'không có mode').toBeVisible();
        await expect(page.getByRole('button', { name: 'Thoát bài thi' })).toBeVisible();
    }
});

test('SP-E02: id không tồn tại hiện trang 404 chung', async ({ page }) => {
    await page.goto(`/speaking/test?id=${crypto.randomUUID()}`);
    await expect(page.getByRole('heading', { name: 'Không tìm thấy trang' })).toBeVisible();
});

test('SP-H04: Chốt câu cuối, bấm Kết thúc khi API chấm còn xử lý: nút chuyển sang "Đang chấm bài…" và bị khoá', async ({
    page,
    db,
}) => {
    const exam = IDS.speaking.published[5];
    const numberOf = await questionNumbers(db, exam);
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    await mockSpeakingScore(page, ({ questionId }) => ({
        ...ok(numberOf)(questionId),
        ...(numberOf[questionId] === 11 && { delay: pending }),
    }));
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    const button = page.getByRole('button', { name: 'Đang chấm bài…' });
    await expect(button).toBeVisible();
    await expect(button).toBeDisabled();
    release();
});

test('SP-H05: Chốt một câu khi API chấm chưa trả về vẫn làm tiếp câu sau được', async ({ page, db }) => {
    const exam = IDS.speaking.published[0];
    const numberOf = await questionNumbers(db, exam);
    let release!: () => void;
    const pending = new Promise<void>((resolve) => (release = resolve));
    let firstDone = false;
    await mockSpeakingScore(page, ({ questionId }) => {
        if (numberOf[questionId] !== 1) return ok(numberOf)(questionId);
        return { ...ok(numberOf)(questionId), delay: pending.then(() => void (firstDone = true)) };
    });
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page, 2);
    await expect(page.getByText('Đang làm câu 3')).toBeVisible();
    await page.getByRole('button', { name: 'Bỏ qua chuẩn bị, nói ngay' }).click();
    await expect(phase(page, 'speak')).toBeVisible();
    expect(firstDone, 'câu 1 vẫn đang chờ chấm').toBe(false);
    release();
});

test('SP-S03: Làm đủ 11 câu và nộp: không request nào upload audio lên storage; audio chỉ gửi tới /api/speaking/score', async ({
    page,
    db,
}) => {
    const exam = IDS.speaking.published[1];
    const numberOf = await questionNumbers(db, exam);
    const requests: { url: string; audio: boolean }[] = [];
    page.on('request', (request) => {
        const body = request.postDataBuffer()?.toString('latin1') ?? '';
        requests.push({
            url: request.url(),
            audio: /name="audio"/.test(body) || /^audio\//.test(request.headers()['content-type'] ?? ''),
        });
    });
    await mockSpeakingScore(page, ({ questionId }) => ok(numberOf)(questionId));
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    await expect(page).toHaveURL(/\/setting\/history\//);
    expect(requests.filter((r) => /\/storage\/v1\/|r2\.cloudflarestorage\.com|\.r2\.dev/.test(r.url))).toEqual([]);
    const withAudio = requests.filter((r) => r.audio);
    expect(withAudio).toHaveLength(11);
    for (const request of withAudio) expect(new URL(request.url).pathname).toBe('/api/speaking/score');
});
