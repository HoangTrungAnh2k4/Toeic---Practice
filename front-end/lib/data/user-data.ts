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
import { supabase } from '@/lib/supabase';
import { readTable, writeTable } from './local-store';

/**
 * Dữ liệu cá nhân (bài làm, câu trả lời, đề đã lưu). Người đã đăng nhập đọc/ghi attempts, responses, annotations
 * trên Supabase; khách và bookmarks (chưa chuyển) vẫn nằm trong localStorage.
 * Đăng ký tài khoản không chuyển dữ liệu khách sang. Hàm đều async để giữ nguyên signature khi đổi nguồn.
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

/**
 * Lộ trình `active` của người dùng đã đăng nhập; khách không có lộ trình.
 * shortcut: chưa có auth nên luôn trả `null`; đọc `study_plans`, `study_plan_weeks`, `plan_tasks` khi nối Supabase.
 */
export async function getActivePlan(): Promise<ActivePlan | null> {
    return null;
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

/** Mới nhất trước. */
export async function listAttempts(): Promise<Attempt[]> {
    if (!(await sessionUserId())) {
        return readTable<Attempt>(ATTEMPTS).sort((a, b) => b.started_at.localeCompare(a.started_at));
    }
    // RLS chỉ trả attempt của chính mình
    const { data, error } = await supabase.from('attempts').select('*').order('started_at', { ascending: false });
    if (error) throw error;
    return data;
}

export async function getAttempt(id: string): Promise<Attempt | null> {
    if (!(await sessionUserId())) return readTable<Attempt>(ATTEMPTS).find((attempt) => attempt.id === id) ?? null;

    const { data, error } = await supabase.from('attempts').select('*').eq('id', id).maybeSingle();
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
    };
    writeTable(ATTEMPTS, [...readTable<Attempt>(ATTEMPTS), attempt]);
    return attempt;
}

/** Chỉ các cột client được phép sửa (grant trên `attempts`); điểm do khâu chấm ghi. */
export type AttemptPatch = Partial<Pick<Attempt, 'status' | 'sample_viewed' | 'submitted_at'>>;

export async function updateAttempt(id: string, patch: AttemptPatch): Promise<Attempt> {
    if (await sessionUserId()) {
        // RLS chỉ cho sửa attempt `in_progress` của chính mình → không khớp dòng nào thì single() báo lỗi
        const { data, error } = await supabase.from('attempts').update(patch).eq('id', id).select().single();
        if (error) throw error;
        return data;
    }

    const rows = readTable<Attempt>(ATTEMPTS);
    const index = rows.findIndex((attempt) => attempt.id === id);
    if (index === -1) throw new Error(`Không tìm thấy bài làm ${id}.`);

    const updated = { ...rows[index], ...patch };
    rows[index] = updated;
    writeTable(ATTEMPTS, rows);
    return updated;
}

export async function listResponses(attemptId: string): Promise<AttemptResponse[]> {
    if (!(await sessionUserId())) {
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
    if (await sessionUserId()) return saveRemoteResponse(attemptId, questionId, patch);

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
                  updated_at: now(),
              }
            : rows[index];
    const saved = { ...base, ...patch, updated_at: now() };

    if (index === -1) rows.push(saved);
    else rows[index] = saved;
    writeTable(RESPONSES, rows);
    return saved;
}

/**
 * Không dùng `.upsert()`: PostgREST SET lại cả attempt_id/question_id khi trùng, mà client chỉ có quyền
 * update text_answer/audio_path → sửa trước, chưa có dòng thì thêm. RLS chặn khi attempt không còn `in_progress`.
 */
async function saveRemoteResponse(attemptId: string, questionId: string, patch: ResponsePatch) {
    const update = () =>
        supabase.from('responses').update(patch).eq('attempt_id', attemptId).eq('question_id', questionId).select().maybeSingle();

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
    return readTable<Bookmark>(BOOKMARKS).map((bookmark) => bookmark.exam_id);
}

/** Trả về trạng thái mới: `true` = đã lưu đề. */
export async function toggleBookmark(examId: string): Promise<boolean> {
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
