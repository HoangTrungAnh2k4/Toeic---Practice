import type { IconType } from 'react-icons';
import { LuCircleAlert, LuCircleCheck, LuInfo, LuMic, LuPenLine, LuRepeat, LuTrendingUp, LuTriangleAlert, LuZap } from 'react-icons/lu';
import {
    Criterion,
    MistakeCriterionFilter,
    MistakeSkill,
    MistakeSkillFilter,
    MistakeSort,
    MistakeStatus,
    MistakeStatusFilter,
    Option,
    Severity,
    StatusMeta,
} from './types';

export const MISTAKES_PATH = '/mistakes';

/** Số bài độc lập liên tiếp không lặp lại để lỗi tự chuyển sang "Đã khắc phục". */
export const RESOLVE_STREAK = 3;

/** Số bài gần nhất (trong phạm vi câu hỏi của lỗi) dùng để tính tần suất. */
export const WINDOW_SIZE = 5;

export const CRITERION_LABEL: Record<Criterion, string> = {
    pronunciation: 'Phát âm',
    intonation: 'Ngữ điệu & trọng âm',
    grammar: 'Ngữ pháp',
    vocabulary: 'Từ vựng',
    cohesion: 'Mạch lạc',
    relevance: 'Bám sát câu hỏi',
    completeness: 'Hoàn thành nhiệm vụ',
    organization: 'Bố cục',
    support: 'Lý do & ví dụ',
};

export const SKILL_META: Record<MistakeSkill, { label: string; Icon: IconType; tile: string; badge: string; accent: string }> = {
    speaking: {
        label: 'Speaking',
        Icon: LuMic,
        tile: 'bg-main text-sub3',
        badge: 'bg-main text-sub1',
        accent: 'bg-main',
    },
    writing: {
        label: 'Writing',
        Icon: LuPenLine,
        tile: 'bg-sub3 text-main',
        badge: 'bg-sub1 text-main ring-1 ring-sub2/60',
        accent: 'bg-sub2',
    },
};

export const STATUS_META: Record<MistakeStatus, StatusMeta> = {
    active: {
        label: 'Đang lặp lại',
        description: 'Vẫn lặp lại ở bài độc lập gần nhất',
        Icon: LuRepeat,
        className: 'bg-sub3 text-main',
    },
    improving: {
        label: 'Đang cải thiện',
        description: `Cần ${RESOLVE_STREAK} bài độc lập liên tiếp không lặp lại`,
        Icon: LuTrendingUp,
        className: 'bg-sub1 text-main ring-1 ring-inset ring-sub2/60',
    },
    resolved: {
        label: 'Đã khắc phục',
        description: `${RESOLVE_STREAK} bài độc lập liên tiếp không lặp lại`,
        Icon: LuCircleCheck,
        className: 'bg-main text-sub1',
    },
};

export const SEVERITY_META: Record<Severity, { label: string; Icon: IconType; weight: number }> = {
    high: { label: 'Ảnh hưởng lớn', Icon: LuTriangleAlert, weight: 3 },
    medium: { label: 'Ảnh hưởng vừa', Icon: LuZap, weight: 2 },
    low: { label: 'Ảnh hưởng nhỏ', Icon: LuInfo, weight: 1 },
};

/** Icon dùng cho lỗi đơn lẻ (không thuộc mẫu lỗi nào trong sổ). */
export const ONE_OFF_ICON = LuCircleAlert;

export const SKILL_OPTIONS: Option<MistakeSkillFilter>[] = [
    { value: 'all', label: 'Tất cả kỹ năng' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
];

export const STATUS_OPTIONS: Option<MistakeStatusFilter>[] = [
    { value: 'open', label: 'Cần khắc phục' },
    { value: 'active', label: STATUS_META.active.label },
    { value: 'improving', label: STATUS_META.improving.label },
    { value: 'resolved', label: STATUS_META.resolved.label },
    { value: 'all', label: 'Tất cả' },
];

export const CRITERION_OPTIONS: Option<MistakeCriterionFilter>[] = [
    { value: 'all', label: 'Tiêu chí: Tất cả' },
    ...(Object.entries(CRITERION_LABEL) as [Criterion, string][]).map(([value, label]) => ({ value, label })),
];

export const SORT_OPTIONS: Option<MistakeSort>[] = [
    { value: 'priority', label: 'Sắp xếp: Ưu tiên khắc phục' },
    { value: 'frequency', label: 'Sắp xếp: Tần suất lặp lại' },
    { value: 'recent', label: 'Sắp xếp: Gặp gần nhất' },
];

export const RESPONSE_VERB: Record<MistakeSkill, string> = {
    speaking: 'Bạn đã nói',
    writing: 'Bạn đã viết',
};

/** Thư viện đề của kỹ năng; thư viện chưa có bộ lọc theo Part nên không lọc sẵn. */
export function getPracticeHref(skill: MistakeSkill) {
    return `/${skill}`;
}

export function getMistakeHref(id: string) {
    return `${MISTAKES_PATH}/${id}`;
}

/** 75 → "01:15" */
export function formatTimestamp(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}
