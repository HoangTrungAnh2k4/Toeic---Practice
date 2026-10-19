/**
 * Domain model theo ERD. Mỗi interface là một row của bảng tương ứng, tên field trùng tên cột (snake_case)
 * để khi có backend thì thay bằng `lib/database.types.ts` do Supabase sinh ra mà không cần lớp map.
 * Thời điểm là chuỗi ISO 8601, ngày là `YYYY-MM-DD`, cột nullable dùng `null`.
 */

export type Skill = 'speaking' | 'writing';

export type UserRole = 'student' | 'admin';

export type ExamSource = 'ets' | 'internal';

export type ExamStatus = 'draft' | 'review' | 'published';

export type AttemptMode = 'cbt' | 'timed' | 'guided';

export type AttemptStatus = 'in_progress' | 'submitted' | 'scoring' | 'scored' | 'interrupted';

/** Tiêu chí chấm theo rubric ETS. */
export type Criterion =
    | 'pronunciation'
    | 'intonation'
    | 'grammar'
    | 'vocabulary'
    | 'cohesion'
    | 'relevance'
    | 'completeness'
    | 'organization'
    | 'support'
    | 'fluency'
    | 'task_response';

export type Severity = 'high' | 'medium' | 'low';

export type PlanStatus = 'active' | 'archived';

export type PlanTaskKind = 'speaking' | 'writing' | 'review' | 'mock' | 'summary';

export interface Profile {
    id: string;
    role: UserRole;
    target_speaking: number | null;
    target_writing: number | null;
    exam_date: string | null;
    preferred_time: string | null;
    reminder_enabled: boolean;
    created_at: string;
    updated_at: string;
}

/** Cấu trúc cố định của một Part theo format ETS hiện hành — dữ liệu tĩnh, xem `PART_TEMPLATES`. */
export interface PartTemplate {
    id: number;
    skill: Skill;
    part_no: number;
    q_from: number;
    q_to: number;
    task: string;
    /** Thời gian đọc ngữ liệu chung trước cả cụm câu (Speaking Q8-10). */
    context_sec: number | null;
    /** Thời gian chuẩn bị mỗi câu. */
    prep_sec: number | null;
    /** Thời gian trả lời từng câu, theo thứ tự q_from → q_to. `null` khi cả Part dùng chung `section_sec`. */
    response_sec: number[] | null;
    /** Đồng hồ chung cho cả Part (Writing Q1-5). */
    section_sec: number | null;
}

export interface Exam {
    id: string;
    /** Mỗi đề chỉ thuộc một kỹ năng — Speaking và Writing thi riêng, không có đề Full Test. */
    skill: Skill;
    code: string;
    title: string;
    edition: number;
    source: ExamSource;
    status: ExamStatus;
    is_verified: boolean;
    topic: string;
    target_level: number | null;
    /** Ghi chú thẩm định cho admin: thiếu ảnh, cần kiểm tra audio... */
    review_note: string | null;
    created_by: string | null;
    published_at: string | null;
    created_at: string;
    updated_at: string;
}

/** Row của view `exam_stats` — tổng hợp lượt làm của mọi người dùng cho một đề. */
export interface ExamStats {
    exam_id: string;
    attempt_count: number;
    /** Tỷ lệ lượt làm nộp đủ bài (%). */
    completion_rate: number;
}

export interface ExamPart {
    id: string;
    exam_id: string;
    part_template_id: number;
    description: string | null;
    /** Ngữ liệu dùng chung cho cả cụm câu: lịch trình, email đề bài... */
    context: string | null;
    context_media_path: string | null;
}

export interface RequiredKeyword {
    /** Dạng gốc hiển thị cho thí sinh. */
    word: string;
    /** Các biến thể được chấp nhận (chia thì, số nhiều...). */
    forms: string[];
}

export interface Question {
    id: string;
    exam_part_id: string;
    number: number;
    /** Yêu cầu của câu: đoạn cần đọc, câu hỏi, đề bài. */
    prompt: string;
    /** Ngữ liệu riêng của câu (email Writing Q6-7); ngữ liệu dùng chung cả cụm nằm ở `exam_parts.context`. */
    stimulus: string | null;
    image_path: string | null;
    image_alt: string | null;
    audio_path: string | null;
    /** Từ khoá bắt buộc (Writing Q1-5). */
    keywords: RequiredKeyword[] | null;
    sample_answer: string | null;
}

export interface Attempt {
    id: string;
    user_id: string;
    exam_id: string;
    /** `null` = làm cả đề, ngược lại là luyện riêng một Part. */
    part_template_id: number | null;
    mode: AttemptMode;
    status: AttemptStatus;
    /** Có xem bài mẫu → không tính là bằng chứng đã tự khắc phục lỗi. */
    sample_viewed: boolean;
    started_at: string;
    /** Hạn nộp; đồng hồ phòng thi đếm theo mốc này, không theo bộ đếm phía client. */
    ends_at: string | null;
    submitted_at: string | null;
    scored_at: string | null;
    /** Điểm thang ETS 0-200 của kỹ năng của đề. */
    score: number | null;
    feedback_summary: string | null;
    scoring_error: string | null;
}

/** Row của bảng `responses` — đặt tên khác để không trùng kiểu `Response` của Fetch API. */
export interface AttemptResponse {
    id: string;
    attempt_id: string;
    question_id: string;
    text_answer: string | null;
    audio_path: string | null;
    /** Speaking: transcript do AI nhận dạng. */
    transcript: string | null;
    score: number | null;
    max_score: number | null;
    /** Chỉ số phụ: phát âm, độ trễ (giây), số từ... */
    metrics: Record<string, number>;
    strengths: string[];
    /** Nhận xét ngắn (tiếng Việt) của khâu chấm. */
    feedback: string | null;
    /** Dịch vụ/model đã chấm câu này, để hiệu chỉnh điểm sau. */
    scoring_model: string | null;
    updated_at: string;
}

export interface Annotation {
    id: string;
    response_id: string;
    /** Thuộc mẫu lỗi trong sổ lỗi; `null` = lỗi đơn lẻ. */
    mistake_pattern_id: string | null;
    /** Vị trí [start, end) trong câu trả lời — dùng để tô sáng thay vì khớp chuỗi. */
    start_offset: number;
    end_offset: number;
    quote: string;
    correction: string;
    explanation: string;
    criterion: Criterion;
    severity: Severity;
    /** Mốc giây trong bản ghi âm (chỉ Speaking). */
    at_sec: number | null;
}

export interface MistakeRemedy {
    /** Nguyên tắc cốt lõi, một câu. */
    rule: string;
    steps: string[];
    phrases: { phrase: string; usage: string }[];
    model: { before: string; after: string };
    /** Tự kiểm tra trước khi nộp bài. */
    checklist: string[];
}

export interface MistakePattern {
    id: string;
    skill: Skill;
    /** `null` = áp dụng cho mọi Part của kỹ năng. */
    part_template_id: number | null;
    title: string;
    summary: string;
    /** Vì sao bị trừ điểm, giải thích theo rubric. */
    why: string;
    criteria: Criterion[];
    severity: Severity;
    impact: string;
    remedy: MistakeRemedy;
}

export interface Bookmark {
    user_id: string;
    exam_id: string;
    created_at: string;
}

export interface StudyPlan {
    id: string;
    user_id: string;
    /** Mỗi ngày học một buổi nên đây cũng là thời lượng một buổi. */
    minutes_per_day: number;
    days_per_week: number;
    status: PlanStatus;
    ai_rationale: string | null;
    created_at: string;
}

export interface StudyPlanWeek {
    plan_id: string;
    week_no: number;
    theme: string;
}

export interface PlanTask {
    id: string;
    plan_id: string;
    scheduled_date: string;
    sort_order: number;
    kind: PlanTaskKind;
    title: string;
    description: string | null;
    /** Tiêu chí cần đạt của buổi học. */
    goal: string | null;
    duration_min: number;
    exam_id: string | null;
    part_template_id: number | null;
    mistake_pattern_id: string | null;
    /** Bài làm mở từ task, phòng thi ghi khi nộp. */
    attempt_id: string | null;
    /** Task không cần bài làm (review, summary) được đánh dấu xong. */
    completed_at: string | null;
}

export interface AiInsightItem {
    skill: Skill;
    part_template_id: number | null;
    mistake_pattern_id: string | null;
    title: string;
    /** Chỉ số ngắn, vd "Tỷ lệ đạt 66% / mục tiêu 90%". */
    metric: string;
    tone: 'critical' | 'warning';
    body: string;
    action_label: string;
    href: string;
}

/** Nhận định do AI sinh cho lịch học, cache để không gọi AI mỗi lần tải trang. */
export interface AiInsight {
    id: string;
    user_id: string;
    payload: { based_on_attempts: number; items: AiInsightItem[] };
    generated_at: string;
}

/** Bảng quy đổi điểm → Level theo ETS: Level là mức cao nhất có `min_score` ≤ điểm. Xem `SCORE_LEVELS`. */
export interface ScoreLevel {
    skill: Skill;
    min_score: number;
    level: number;
}

/**
 * Trạng thái mẫu lỗi, TÍNH TỰ ĐỘNG từ các bài gần nhất:
 * - active: lặp lại ở bài gần nhất trong phạm vi.
 * - improving: đã có ít nhất 1 bài độc lập liên tiếp không lặp lại.
 * - resolved: đủ số bài độc lập liên tiếp không lặp lại.
 */
export type MistakeStatus = 'active' | 'improving' | 'resolved';

/** Row của view `user_mistake_stats` — một mẫu lỗi trong sổ lỗi của một người dùng. */
export interface UserMistakeStats {
    user_id: string;
    mistake_pattern_id: string;
    status: MistakeStatus;
    /** Số bài lặp lại lỗi trong cửa sổ theo dõi. */
    hit_count: number;
    /** Số bài trong cửa sổ theo dõi. */
    window_count: number;
    /** Số bài độc lập liên tiếp gần nhất không lặp lại lỗi. */
    clean_streak: number;
    occurrence_count: number;
    last_seen_attempt_id: string | null;
    last_seen_at: string | null;
    priority: number;
}

/** Row của view `user_skill_stats` — tổng hợp theo kỹ năng của một người dùng. */
export interface UserSkillStats {
    user_id: string;
    skill: Skill;
    attempt_count: number;
    scored_count: number;
    latest_score: number | null;
    latest_scored_at: string | null;
    total_minutes: number;
}

/** Row của view `user_part_stats` — số lượt và điểm trung bình theo Part. */
export interface UserPartStats {
    user_id: string;
    part_template_id: number;
    attempt_count: number;
    /** Điểm trung bình / điểm tối đa của các câu thuộc Part (0-1); `null` khi chưa có câu nào được chấm. */
    avg_score_ratio: number | null;
}

/** Row của view `user_study_stats` — thói quen học của một người dùng. */
export interface UserStudyStats {
    user_id: string;
    streak_days: number;
    best_streak_days: number;
    minutes_this_month: number;
}
