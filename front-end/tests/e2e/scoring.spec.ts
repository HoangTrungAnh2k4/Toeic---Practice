import {
    answerAllGuided,
    answerPart,
    expect,
    IDS,
    insertAttempt,
    insertResponse,
    localTable,
    mockSpeakingScore,
    mockWritingScore,
    openSpeakingRoom,
    openWritingRoom,
    questionIds,
    questionNumbers,
    reviewLevel,
    reviewScore,
    reviewSummary,
    speakingResult,
    submitPart,
    test,
    writingOutcomes,
} from './fixtures';

const W1 = IDS.writing.published[0];
const W2 = IDS.writing.published[1];

test('SC-C01: Hai lượt Speaking đã chấm 120 và 130: trang xem lại hiện Level 5 và Level 6', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    for (const [index, [score, level]] of [
        [120, 'Level 5'],
        [130, 'Level 6'],
    ].entries()) {
        const id = await insertAttempt(db, { user_id: user.id, exam_id: IDS.speaking.published[index], score: score as number });
        await page.goto(`/setting/history/${id}`);
        await expect(reviewScore(page), String(score)).toHaveText(String(score));
        await expect(reviewLevel(page), String(score)).toHaveText(level as string);
    }
});

test('SC-C02: Ba lượt Writing điểm 40, 50 và 200 hiện Level 2, Level 3, Level 9', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    for (const [score, level] of [
        [40, 'Level 2'],
        [50, 'Level 3'],
        [200, 'Level 9'],
    ] as const) {
        const id = await insertAttempt(db, { user_id: user.id, exam_id: W1, part_template_id: 6, score });
        await page.goto(`/setting/history/${id}`);
        await expect(reviewScore(page), String(score)).toHaveText(String(score));
        await expect(reviewLevel(page), String(score)).toHaveText(level);
    }
});

test('SC-C03: Writing đủ 3 Part hiện tổng điểm cả bài (0–200); bài thiếu Part không hiện tổng cả bài', async ({ page, db, freshStudent }) => {
    const user = await freshStudent();
    const scoredParts = async (examId: string, parts: number[]) => {
        const ids = await questionIds(db, examId);
        let last = '';
        for (const [index, part] of parts.entries()) {
            last = await insertAttempt(db, {
                user_id: user.id,
                exam_id: examId,
                part_template_id: part,
                score: 100,
                started_at: new Date(Date.now() - (10 - index) * 60_000).toISOString(),
            });
            const numbers = part === 6 ? [1, 2, 3, 4, 5] : part === 7 ? [6, 7] : [8];
            for (const number of numbers) {
                await insertResponse(db, { attempt_id: last, question_id: ids[number], text_answer: 'answer', score: 2, max_score: number <= 5 ? 3 : number <= 7 ? 4 : 5 });
            }
        }
        return last;
    };
    const full = await scoredParts(W1, [6, 7, 8]);
    const partial = await scoredParts(W2, [6, 7]);

    await page.goto(`/setting/history/${full}`);
    await expect(reviewSummary(page)).toBeVisible();
    const total = reviewSummary(page).getByText(/tổng[^/]*cả bài/i);
    await expect(total).toBeVisible();
    const value = Number((await total.innerText()).match(/(\d{1,3})\s*\/\s*200/)?.[1]);
    expect(value).toBeGreaterThanOrEqual(0);
    expect(value).toBeLessThanOrEqual(200);

    await page.goto(`/setting/history/${partial}`);
    await expect(reviewScore(page)).toHaveText('100');
    await expect(reviewSummary(page).getByText(/tổng[^/]*cả bài/i)).toHaveCount(0);
});

test('SC-E01: Lượt đang chấm: trang hiện "Đang chấm", tự tải lại mỗi 4s và dừng sau 2 phút', async ({ page, db, freshStudent }) => {
    test.setTimeout(300_000);
    const user = await freshStudent();
    const start = Date.now();
    const id = await insertAttempt(db, {
        user_id: user.id,
        exam_id: W1,
        part_template_id: 6,
        status: 'scoring',
        started_at: new Date(start).toISOString(),
        submitted_at: new Date(start).toISOString(),
        scoring_started_at: new Date(start).toISOString(),
    });
    let reloads = 0;
    page.on('request', (request) => {
        if (request.url().includes('/rest/v1/attempts') && request.url().includes(`id=eq.${id}`)) reloads += 1;
    });
    await page.clock.install({ time: start });
    await page.goto(`/setting/history/${id}`);
    await expect(page.getByRole('heading', { name: 'E2E Writing 1' })).toBeVisible();
    await expect.soft(page.getByText(/đang chấm/i).first()).toBeVisible();

    const now = await page.evaluate(() => Date.now());
    await page.clock.pauseAt(now + 100);
    let fakeNow = now + 100;
    await page.waitForTimeout(500);
    const base = reloads;

    // Lần tải lại đầu: đặt nhịp 4s bắt đầu từ thời điểm đồng hồ đang dừng
    await page.clock.runFor(4000);
    fakeNow += 4000;
    await expect.poll(() => reloads).toBe(base + 1);

    // Nhịp đúng 4s: chưa tới 4s thì chưa tải lại
    await page.clock.runFor(3500);
    await page.waitForTimeout(800);
    expect(reloads, 'chưa đủ 4s').toBe(base + 1);
    await page.clock.runFor(500);
    fakeNow += 4000;
    await expect.poll(() => reloads).toBe(base + 2);

    let expected = base + 2;
    while (fakeNow - start < 120_000) {
        await page.clock.runFor(4000);
        fakeNow += 4000;
        expected += 1;
        await expect.poll(() => reloads, `tải lại lúc ${Math.round((fakeNow - start) / 1000)}s`).toBe(expected);
    }
    // Đã quá 2 phút kể từ lúc bắt đầu chấm: không tải lại nữa
    await page.clock.runFor(20_000);
    await page.waitForTimeout(2000);
    expect(reloads).toBe(expected);
});

test('SC-C04: Làm đủ 11 câu Speaking, tổng thô 21/35: tổng 120/200 và Level 5', async ({ page, db }) => {
    const exam = IDS.speaking.published[2];
    const numberOf = await questionNumbers(db, exam);
    // Câu 1–10: 2/3 điểm (20), câu 11: 1/5 → tổng thô 21/35
    await mockSpeakingScore(page, ({ questionId }) =>
        numberOf[questionId] === 11 ? { status: 200, body: speakingResult(1, 5) } : { status: 200, body: speakingResult(2, 3) },
    );
    await openSpeakingRoom(page, exam, 'guided');
    await answerAllGuided(page);
    await expect(page).toHaveURL(/\/setting\/history\/[0-9a-f-]{36}/);
    await expect(reviewScore(page)).toHaveText('120');
    await expect(reviewLevel(page)).toHaveText('Level 5');
});

test('SC-C05: Writing Part 1 tổng thô 15/15 được 200/200; Part 2 tổng thô 4/8 được 100/200', async ({ page, db }) => {
    const numberOf = await questionNumbers(db, W2);
    await mockWritingScore(page, (body) => writingOutcomes(body, numberOf, (number) => (number <= 5 ? 3 : 2)));
    await openWritingRoom(page, W2);
    await answerPart(page, Array(5).fill('A woman is carrying a box to the office.'));
    await submitPart(page);
    await expect(page).toHaveURL(/[?&]part=7(&|$)/);
    await answerPart(page, ['Could you tell me when the items will arrive?', 'I suggest sending them next week.']);
    await submitPart(page);
    await expect(page).toHaveURL(/[?&]part=8(&|$)/);

    type Local = { id: string; part_template_id: number; status: string };
    const scored = async (part: number) => (await localTable<Local>(page, 'attempts')).find((a) => a.part_template_id === part && a.status === 'scored');
    await expect.poll(async () => Boolean((await scored(6)) && (await scored(7)))).toBe(true);
    const [part1, part2] = [(await scored(6))!, (await scored(7))!];

    await page.goto(`/setting/history/${part1.id}`);
    await expect(reviewScore(page)).toHaveText('200');
    await page.goto(`/setting/history/${part2.id}`);
    await expect(reviewScore(page)).toHaveText('100');
});
