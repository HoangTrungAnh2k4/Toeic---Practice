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
 * Dữ liệu cá nhân (bài làm, câu trả lời, đề đã lưu). Hiện mọi người dùng đều là khách và dữ liệu nằm trong
 * localStorage; khi có backend, người đã đăng nhập đọc từ Supabase còn khách giữ nguyên nhánh này.
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
    // getSession đọc phiên đã lưu (và chờ xử lý session trong URL sau OAuth), không gọi mạng
    const { data: auth } = await supabase.auth.getSession();
    if (!auth.session) return null;

    const { data, error } = await supabase.from('profiles').select('*').eq('id', auth.session.user.id).maybeSingle();
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

/** Mới nhất trước. */
export async function listAttempts(): Promise<Attempt[]> {
    return readTable<Attempt>(ATTEMPTS).sort((a, b) => b.started_at.localeCompare(a.started_at));
}

export async function getAttempt(id: string): Promise<Attempt | null> {
    return readTable<Attempt>(ATTEMPTS).find((attempt) => attempt.id === id) ?? null;
}

export interface StartAttemptInput {
    exam_id: string;
    part_template_id: number | null;
    mode: AttemptMode;
    /** Thời lượng làm bài; bỏ trống khi không giới hạn giờ (chế độ có hướng dẫn). */
    duration_sec: number | null;
}

export async function startAttempt({ exam_id, part_template_id, mode, duration_sec }: StartAttemptInput) {
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

export type AttemptPatch = Partial<Omit<Attempt, 'id' | 'user_id' | 'exam_id' | 'started_at'>>;

export async function updateAttempt(id: string, patch: AttemptPatch): Promise<Attempt> {
    const rows = readTable<Attempt>(ATTEMPTS);
    const index = rows.findIndex((attempt) => attempt.id === id);
    if (index === -1) throw new Error(`Không tìm thấy bài làm ${id}.`);

    const updated = { ...rows[index], ...patch };
    rows[index] = updated;
    writeTable(ATTEMPTS, rows);
    return updated;
}

export async function listResponses(attemptId: string): Promise<AttemptResponse[]> {
    return readTable<AttemptResponse>(RESPONSES).filter((response) => response.attempt_id === attemptId);
}

export type ResponsePatch = Partial<Omit<AttemptResponse, 'id' | 'attempt_id' | 'question_id' | 'updated_at'>>;

/** Upsert theo cặp (attempt_id, question_id) — dùng cho autosave. */
export async function saveResponse(attemptId: string, questionId: string, patch: ResponsePatch) {
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

/** Nhận xét của AI cho các câu trả lời; chỉ khâu chấm bài ghi bảng này. */
export async function listAnnotations(responseIds: string[]): Promise<Annotation[]> {
    const ids = new Set(responseIds);
    return readTable<Annotation>(ANNOTATIONS).filter((annotation) => ids.has(annotation.response_id));
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
