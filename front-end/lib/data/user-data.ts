import type {
    AiInsight,
    Annotation,
    Attempt,
    AttemptMode,
    AttemptResponse,
    Bookmark,
    PlanTask,
    Profile,
    StudyPlan,
    StudyPlanWeek,
} from '@/lib/domain/types';
import { SCORE_ERROR_MESSAGE, summarizeSpeaking, summarizeWriting, type ScoredQuestion } from '@/lib/scoring/scale';
import type { WritingOutcome } from '@/lib/scoring/writing';
import { supabase } from '@/lib/supabase';
import type { PlanDraft } from './generate-plan';
import { readTable, writeTable } from './local-store';
import { toDayKey } from './user-stats';

/**
 * Dữ liệu cá nhân (bài làm, câu trả lời, đề đã lưu). Người đã đăng nhập đọc/ghi attempts, responses, annotations,
 * bookmarks trên Supabase; khách vẫn nằm trong localStorage.
 * Đăng nhập/đăng ký không chuyển dữ liệu khách sang tài khoản (chốt ở E1-5). Hàm đều async để giữ nguyên signature khi đổi nguồn.
 */
export const GUEST_USER_ID = 'guest';

const ATTEMPTS = 'attempts';
const RESPONSES = 'responses';
const BOOKMARKS = 'bookmarks';
const ANNOTATIONS = 'annotations';

const now = () => new Date().toISOString();

/**
 * Hồ sơ của người dùng đã đăng nhập; khách không có hồ sơ nên mục tiêu, ngày thi, giờ học đều ẩn.
 * Dòng `profiles` do trigger tạo lúc đăng ký, RLS chỉ cho đọc của chính mình.
 */
export async function getProfile(): Promise<Profile | null> {
    const userId = await sessionUserId();
    if (!userId) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (error) throw error;
    return data;
}

export interface ActivePlan {
    plan: StudyPlan;
    weeks: StudyPlanWeek[];
    /** Theo `scheduled_date`, rồi `sort_order`. */
    tasks: PlanTask[];
}

/** Lộ trình `active` mới nhất của người dùng đã đăng nhập; khách không có lộ trình. */
export async function getActivePlan(): Promise<ActivePlan | null> {
    if (!(await sessionUserId())) return null;
    // RLS chỉ trả lộ trình của chính mình
    const { data: plan, error } = await supabase
        .from('study_plans')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
    if (error) throw error;
    if (!plan) return null;

    const [weeks, tasks] = await Promise.all([
        supabase.from('study_plan_weeks').select('*').eq('plan_id', plan.id).order('week_no'),
        supabase.from('plan_tasks').select('*').eq('plan_id', plan.id).order('scheduled_date').order('sort_order'),
    ]);
    if (weeks.error) throw weeks.error;
    if (tasks.error) throw tasks.error;
    return { plan, weeks: weeks.data, tasks: tasks.data };
}

/** Đổi thời lượng mỗi buổi học của lộ trình. */
export async function updatePlanMinutes(planId: string, minutesPerDay: number): Promise<void> {
    const { data, error } = await supabase
        .from('study_plans')
        .update({ minutes_per_day: minutesPerDay })
        .eq('id', planId)
        .select('id');
    if (error) throw error;
    // RLS chặn thì không báo lỗi, chỉ cập nhật 0 dòng
    if (data.length === 0) throw new Error('Plan not found');
}

export type PlanGoals = Pick<Profile, 'target_speaking' | 'target_writing' | 'exam_date'>;

/** Lưu mục tiêu + thay lộ trình `active` bằng `draft` trong một transaction (RPC `create_study_plan`). */
export async function createStudyPlan(goals: PlanGoals, draft: PlanDraft): Promise<void> {
    const { error } = await supabase.rpc('create_study_plan', { payload: { ...goals, ...draft } });
    if (error) throw error;
}

/** Đánh dấu xong task không cần bài làm (review, summary). */
export async function completePlanTask(taskId: string): Promise<void> {
    const { data, error } = await supabase
        .from('plan_tasks')
        .update({ completed_at: now() })
        .eq('id', taskId)
        .select('id');
    if (error) throw error;
    if (data.length === 0) throw new Error('Task not found');
}

/**
 * Gắn lượt vừa nộp vào task chưa xong sớm nhất (tới hôm nay) của lộ trình `active`: ưu tiên task thi thử cùng đề, rồi
 * task luyện cùng Part. Không có task khớp thì bỏ qua.
 */
export async function linkPlanTask(attempt: Pick<Attempt, 'id' | 'exam_id' | 'part_template_id'>): Promise<void> {
    if (!(await isRemoteAttempt(attempt.id))) return;
    const active = await getActivePlan();
    if (!active) return;

    const today = toDayKey(new Date());
    const open = active.tasks.filter((item) => !item.attempt_id && !item.completed_at && item.scheduled_date <= today);
    // shortcut: Writing lưu mỗi Part một lượt nên task thi thử Writing xong ngay ở Part đầu; cần cờ "cả đề" trên attempt để khớp chuẩn
    const task =
        open.find((item) => item.kind === 'mock' && item.exam_id === attempt.exam_id) ??
        open.find((item) => attempt.part_template_id !== null && item.part_template_id === attempt.part_template_id);
    if (!task) return;

    // `attempt_id is null`: tab khác vừa gắn thì không ghi đè
    const { error } = await supabase
        .from('plan_tasks')
        .update({ attempt_id: attempt.id })
        .eq('id', task.id)
        .is('attempt_id', null);
    if (error) throw error;
}

/** shortcut: chưa có auth nên luôn trả `null`; đọc bản mới nhất của `ai_insights` khi nối Supabase. */
export async function getLatestInsight(): Promise<AiInsight | null> {
    return null;
}

/** Id người đã đăng nhập, `null` = khách. getSession đọc phiên đã lưu, không gọi mạng. */
async function sessionUserId(): Promise<string | null> {
    const { data } = await supabase.auth.getSession();
    return data.session?.user.id ?? null;
}

/**
 * Dữ liệu của attempt nằm trên Supabase? Attempt tạo lúc còn là khách ở lại localStorage cho tới khi xong, kể cả khi
 * người dùng đăng nhập ở tab khác giữa chừng — không thì lượt lưu kế tiếp gửi id cục bộ lên Supabase và lỗi.
 */
async function isRemoteAttempt(attemptId: string): Promise<boolean> {
    if (readTable<Attempt>(ATTEMPTS).some((attempt) => attempt.id === attemptId)) return false;
    return (await sessionUserId()) !== null;
}

/** Lượt làm của người dùng, mới nhất trước; truyền `examId` để chỉ lấy lượt của một đề. */
export async function listAttempts(examId?: string): Promise<Attempt[]> {
    if (!(await sessionUserId())) {
        return readTable<Attempt>(ATTEMPTS)
            .filter((attempt) => !examId || attempt.exam_id === examId)
            .sort((a, b) => b.started_at.localeCompare(a.started_at));
    }
    // RLS chỉ trả attempt của chính mình
    let query = supabase.from('attempts').select('*');
    if (examId) query = query.eq('exam_id', examId);
    const { data, error } = await query.order('started_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAttempt(id: string): Promise<Attempt | null> {
    if (!(await isRemoteAttempt(id))) return readTable<Attempt>(ATTEMPTS).find((attempt) => attempt.id === id) ?? null;

    const { data, error } = await supabase.from('attempts').select('*').eq('id', id).maybeSingle();
    // 22P02: id trên URL không phải uuid → coi như không tồn tại thay vì lỗi tải
    if (error?.code === '22P02') return null;
    if (error) throw error;
    return data;
}

export interface StartAttemptInput {
    exam_id: string;
    part_template_id: number | null;
    mode: AttemptMode;
    /** Thời lượng làm bài; bỏ trống khi không giới hạn giờ (chế độ có hướng dẫn). Chỉ dùng cho khách: DB tự tính `ends_at`. */
    duration_sec: number | null;
}

export async function startAttempt({ exam_id, part_template_id, mode, duration_sec }: StartAttemptInput) {
    if (await sessionUserId()) {
        // id, user_id, ends_at do DB sinh (client không có quyền ghi các cột này)
        const { data, error } = await supabase
            .from('attempts')
            .insert({ exam_id, part_template_id, mode })
            .select()
            .single();
        if (error) throw error;
        return data;
    }

    const startedAt = new Date();
    const attempt: Attempt = {
        id: crypto.randomUUID(),
        user_id: GUEST_USER_ID,
        exam_id,
        part_template_id,
        mode,
        status: 'in_progress',
        sample_viewed: false,
        started_at: startedAt.toISOString(),
        ends_at: duration_sec === null ? null : new Date(startedAt.getTime() + duration_sec * 1000).toISOString(),
        submitted_at: null,
        scored_at: null,
        score: null,
        feedback_summary: null,
        scoring_error: null,
        scoring_started_at: null,
    };
    writeTable(ATTEMPTS, [...readTable<Attempt>(ATTEMPTS), attempt]);
    return attempt;
}

/**
 * Lượt làm dở (đang làm hoặc đã thoát giữa chừng) của đúng đề & Part kèm câu đã trả lời; lượt `interrupted` được
 * mở lại thành `in_progress`. Không có thì tạo lượt mới.
 */
async function resumeOrStart(input: StartAttemptInput) {
    const existing = (await listAttempts(input.exam_id)).find(
        (attempt) =>
            attempt.part_template_id === input.part_template_id &&
            (attempt.status === 'in_progress' || attempt.status === 'interrupted'),
    );
    if (!existing) return { attempt: await startAttempt(input), responses: [] as AttemptResponse[], isRestored: false };

    const attempt =
        existing.status === 'interrupted' ? await updateAttempt(existing.id, { status: 'in_progress' }) : existing;
    return { attempt, responses: await listResponses(attempt.id), isRestored: true };
}

const pendingResumes = new Map<string, ReturnType<typeof resumeOrStart>>();

/** Gọi trùng cho cùng đề & Part (StrictMode chạy effect 2 lần) dùng chung một lần khởi tạo, không tạo trùng attempt. */
export function resumeOrStartAttempt(input: StartAttemptInput) {
    const key = `${input.exam_id}:${input.part_template_id}`;
    let promise = pendingResumes.get(key);
    if (!promise) {
        promise = resumeOrStart(input).finally(() => pendingResumes.delete(key));
        pendingResumes.set(key, promise);
    }
    return promise;
}

/** Chỉ các cột client được phép sửa (grant trên `attempts`); điểm do khâu chấm ghi. */
export type AttemptPatch = Partial<Pick<Attempt, 'status' | 'sample_viewed' | 'submitted_at'>>;

export async function updateAttempt(id: string, patch: AttemptPatch): Promise<Attempt> {
    if (await isRemoteAttempt(id)) {
        // RLS chỉ cho sửa attempt `in_progress` của chính mình → không khớp dòng nào thì single() báo lỗi
        const { data, error } = await supabase.from('attempts').update(patch).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    return patchLocalAttempt(id, patch);
}

/** Khách: mọi cột của attempt (kể cả điểm) đều ghi vào localStorage. */
function patchLocalAttempt(id: string, patch: Partial<Attempt>): Attempt {
    const rows = readTable<Attempt>(ATTEMPTS);
    const index = rows.findIndex((attempt) => attempt.id === id);
    if (index === -1) throw new Error(`Không tìm thấy bài làm ${id}.`);

    const updated = { ...rows[index], ...patch };
    rows[index] = updated;
    writeTable(ATTEMPTS, rows);
    return updated;
}

export async function listResponses(attemptId: string): Promise<AttemptResponse[]> {
    if (!(await isRemoteAttempt(attemptId))) {
        return readTable<AttemptResponse>(RESPONSES).filter((response) => response.attempt_id === attemptId);
    }
    const { data, error } = await supabase.from('responses').select('*').eq('attempt_id', attemptId);
    if (error) throw error;
    // metrics, strengths là jsonb do khâu chấm ghi theo dạng của AttemptResponse
    return data as AttemptResponse[];
}

/** Chỉ các cột client được phép ghi (grant trên `responses`); điểm, transcript do khâu chấm ghi. */
export type ResponsePatch = Partial<Pick<AttemptResponse, 'text_answer' | 'audio_path'>>;

/** Upsert theo cặp (attempt_id, question_id) — dùng cho autosave. */
export async function saveResponse(attemptId: string, questionId: string, patch: ResponsePatch) {
    if (await isRemoteAttempt(attemptId)) return saveRemoteResponse(attemptId, questionId, patch);
    return saveLocalResponse(attemptId, questionId, patch);
}

/** Khách: mọi cột (kể cả điểm) đều ghi vào localStorage. */
function saveLocalResponse(attemptId: string, questionId: string, patch: Partial<AttemptResponse>) {
    const rows = readTable<AttemptResponse>(RESPONSES);
    const index = rows.findIndex((row) => row.attempt_id === attemptId && row.question_id === questionId);
    const base: AttemptResponse =
        index === -1
            ? {
                  id: crypto.randomUUID(),
                  attempt_id: attemptId,
                  question_id: questionId,
                  text_answer: null,
                  audio_path: null,
                  transcript: null,
                  score: null,
                  max_score: null,
                  metrics: {},
                  strengths: [],
                  feedback: null,
                  scoring_model: null,
                  updated_at: now(),
              }
            : rows[index];
    const saved = { ...base, ...patch, updated_at: now() };

    if (index === -1) rows.push(saved);
    else rows[index] = saved;
    writeTable(RESPONSES, rows);
    return saved;
}

/** Nhà cung cấp hoặc hạn mức lượt chấm trong ngày đã hết (HTTP 429). */
export class ScoringLimitError extends Error {}

type AnswerScore = Pick<
    AttemptResponse,
    'score' | 'max_score' | 'transcript' | 'metrics' | 'feedback' | 'scoring_model'
>;

/**
 * Gửi bài nói của một câu đi chấm (`/api/speaking/score`); audio không được lưu ở đâu.
 * Người đăng nhập: server đã ghi điểm vào `responses`. Khách: lưu kết quả vào localStorage.
 */
export async function scoreSpeakingAnswer(attemptId: string, questionId: string, audio: Blob) {
    const form = new FormData();
    form.append('audio', audio);
    form.append('attemptId', attemptId);
    form.append('questionId', questionId);
    const response = await fetch('/api/speaking/score', { method: 'POST', body: form });
    if (response.status === 429) throw new ScoringLimitError();
    if (!response.ok) throw new Error(`Scoring failed: ${response.status}`);

    const result = (await response.json()) as AnswerScore;
    if (!(await isRemoteAttempt(attemptId))) saveLocalResponse(attemptId, questionId, result);
    return result;
}

/** Nộp bài Speaking: tính tổng 0–200 từ điểm từng câu và đóng attempt (`scored`). */
export async function finalizeSpeakingAttempt(attemptId: string, questions: ScoredQuestion[]) {
    if (await isRemoteAttempt(attemptId)) {
        const response = await fetch('/api/speaking/finalize', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ attemptId }),
        });
        if (!response.ok) throw new Error(`Finalize failed: ${response.status}`);
        return;
    }

    const summary = summarizeSpeaking(questions, await listResponses(attemptId));
    patchLocalAttempt(attemptId, {
        status: 'scored',
        submitted_at: now(),
        scored_at: now(),
        score: summary.score,
        feedback_summary: summary.feedbackSummary,
        scoring_error: summary.scoringError,
    });
}

/**
 * Chấm một Part Writing đã nộp (`/api/writing/score`), gọi chạy nền sau khi nộp hoặc khi bấm "Chấm lại".
 * Người đăng nhập: route tự ghi kết quả lên DB. Khách: gửi bài các câu chưa có điểm, lưu điểm + annotations vào
 * localStorage rồi tự tổng kết; lỗi ghi vào `scoring_error` để trang xem bài cho chấm lại.
 */
export async function scoreWritingAttempt(attempt: Attempt, questions: ScoredQuestion[]): Promise<void> {
    if (await isRemoteAttempt(attempt.id)) {
        await fetch('/api/writing/score', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ attemptId: attempt.id }),
        });
        return;
    }

    patchLocalAttempt(attempt.id, { status: 'scoring', scoring_started_at: now() });
    try {
        const responses = await listResponses(attempt.id);
        const answerOf = (questionId: string) => responses.find((response) => response.question_id === questionId);
        const pending = questions.filter((question) => answerOf(question.id)?.score == null);
        let scoringError: string | null = null;

        if (pending.length > 0) {
            const response = await fetch('/api/writing/score', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({
                    examId: attempt.exam_id,
                    partTemplateId: attempt.part_template_id,
                    answers: pending.map((question) => ({
                        questionId: question.id,
                        text: answerOf(question.id)?.text_answer ?? '',
                    })),
                }),
            });
            const body = (await response.json().catch(() => null)) as { outcomes?: WritingOutcome[] } | null;
            if (!body?.outcomes) throw new Error(`Writing scoring failed: ${response.status}`);

            for (const outcome of body.outcomes) {
                if ('error' in outcome) {
                    scoringError ??= SCORE_ERROR_MESSAGE[outcome.error];
                    continue;
                }
                const { annotations, ...score } = outcome.result;
                const saved = saveLocalResponse(attempt.id, outcome.questionId, score);
                const kept = readTable<Annotation>(ANNOTATIONS).filter((row) => row.response_id !== saved.id);
                const added = annotations.map((annotation) => ({
                    ...annotation,
                    id: crypto.randomUUID(),
                    response_id: saved.id,
                    at_sec: null,
                }));
                writeTable(ANNOTATIONS, [...kept, ...added]);
            }
        }

        if (scoringError) {
            patchLocalAttempt(attempt.id, { status: 'submitted', scoring_error: scoringError });
            return;
        }
        const summary = summarizeWriting(questions, await listResponses(attempt.id));
        patchLocalAttempt(attempt.id, {
            status: 'scored',
            scored_at: now(),
            score: summary.score,
            feedback_summary: summary.feedbackSummary,
            scoring_error: null,
        });
    } catch {
        patchLocalAttempt(attempt.id, { status: 'submitted', scoring_error: SCORE_ERROR_MESSAGE.scoring_failed });
    }
}

/**
 * Không dùng `.upsert()`: PostgREST SET lại cả attempt_id/question_id khi trùng, mà client chỉ có quyền
 * update text_answer/audio_path → sửa trước, chưa có dòng thì thêm. RLS chặn khi attempt không còn `in_progress`.
 */
async function saveRemoteResponse(attemptId: string, questionId: string, patch: ResponsePatch) {
    const update = () =>
        supabase
            .from('responses')
            .update(patch)
            .eq('attempt_id', attemptId)
            .eq('question_id', questionId)
            .select()
            .maybeSingle();

    const updated = await update();
    if (updated.error) throw updated.error;
    if (updated.data) return updated.data as AttemptResponse;

    const inserted = await supabase
        .from('responses')
        .insert({ attempt_id: attemptId, question_id: questionId, ...patch })
        .select()
        .single();
    // 23505: lượt lưu song song vừa thêm dòng này trước → sửa lại dòng đó
    if (inserted.error?.code === '23505') {
        const retried = await update();
        if (retried.error) throw retried.error;
        if (retried.data) return retried.data as AttemptResponse;
    }
    if (inserted.error) throw inserted.error;
    return inserted.data as AttemptResponse;
}

/** Nhận xét của AI cho các câu trả lời; chỉ khâu chấm bài ghi bảng này. */
export async function listAnnotations(responseIds: string[]): Promise<Annotation[]> {
    if (!(await sessionUserId())) {
        const ids = new Set(responseIds);
        return readTable<Annotation>(ANNOTATIONS).filter((annotation) => ids.has(annotation.response_id));
    }
    if (responseIds.length === 0) return [];
    const { data, error } = await supabase.from('annotations').select('*').in('response_id', responseIds);
    if (error) throw error;
    return data;
}

export async function listBookmarkedExamIds(): Promise<string[]> {
    if (!(await sessionUserId())) return readTable<Bookmark>(BOOKMARKS).map((bookmark) => bookmark.exam_id);

    const { data, error } = await supabase.from('bookmarks').select('exam_id');
    if (error) throw error;
    return data.map((bookmark) => bookmark.exam_id);
}

/** Trả về trạng thái mới: `true` = đã lưu đề. */
export async function toggleBookmark(examId: string): Promise<boolean> {
    if (await sessionUserId()) return toggleRemoteBookmark(examId);

    const rows = readTable<Bookmark>(BOOKMARKS);
    const exists = rows.some((bookmark) => bookmark.exam_id === examId);
    writeTable(
        BOOKMARKS,
        exists
            ? rows.filter((bookmark) => bookmark.exam_id !== examId)
            : [...rows, { user_id: GUEST_USER_ID, exam_id: examId, created_at: now() }],
    );
    return !exists;
}

/** Xoá trước: có dòng bị xoá = vừa bỏ lưu, không thì thêm. `user_id` do DB lấy từ `auth.uid()`. */
async function toggleRemoteBookmark(examId: string): Promise<boolean> {
    const deleted = await supabase.from('bookmarks').delete().eq('exam_id', examId).select('exam_id');
    if (deleted.error) throw deleted.error;
    if (deleted.data.length > 0) return false;

    const { error } = await supabase.from('bookmarks').insert({ exam_id: examId });
    // 23505: lượt bấm song song vừa lưu đề này → kết quả vẫn là đã lưu
    if (error && error.code !== '23505') throw error;
    return true;
}
