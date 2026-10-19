import type { IconType } from 'react-icons';
import { LuMic, LuPenLine } from 'react-icons/lu';
import { PART_TEMPLATES } from '@/lib/domain/parts';
import type { Attempt, AttemptMode, AttemptStatus, Skill } from '@/lib/domain/types';
import { buildTestHref } from '@/lib/exam-library/search-params';
import {
    CategoryFilterType,
    DateScopeType,
    ExamModeType,
    HistoryRow,
    Option,
    SkillType,
    StatusFilterType,
} from './types';

export const SKILL_OPTIONS: Option<SkillType>[] = [
    { value: 'all', label: 'Tất cả kỹ năng' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
];

export const MODE_LABEL: Record<AttemptMode, string> = {
    cbt: 'Thi thử chuẩn (CBT)',
    timed: 'Luyện có thời gian',
    guided: 'Học có hướng dẫn',
};

export const MODE_OPTIONS: Option<ExamModeType>[] = [
    { value: 'all', label: 'Chế độ: Tất cả' },
    ...(Object.keys(MODE_LABEL) as AttemptMode[]).map((value) => ({ value, label: MODE_LABEL[value] })),
];

export const CATEGORY_OPTIONS: Option<CategoryFilterType>[] = [
    { value: 'all', label: 'Phân loại: Đề & Trợ giúp' },
    { value: 'fresh', label: 'Làm lần đầu' },
    { value: 'retake', label: 'Làm lại (Retake)' },
    { value: 'sample_viewed', label: 'Đã xem mẫu gợi ý' },
    { value: 'independent', label: 'Độc lập hoàn toàn' },
];

export const STATUS_OPTIONS: Option<StatusFilterType>[] = [
    { value: 'all', label: 'Trạng thái: Tất cả' },
    { value: 'scored', label: 'Đã chấm điểm' },
    { value: 'pending', label: 'Đang chờ AI chấm' },
    { value: 'in_progress', label: 'Đang làm dở' },
    { value: 'interrupted', label: 'Bị gián đoạn' },
];

export const DATE_SCOPE_OPTIONS: Option<DateScopeType>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: '7d', label: '7 ngày gần nhất' },
    { value: '30d', label: '30 ngày qua' },
    { value: 'this_month', label: 'Tháng này' },
];

export const PAGE_SIZE_OPTIONS: Option<number>[] = [
    { value: 10, label: '10 dòng' },
    { value: 25, label: '25 dòng' },
    { value: 50, label: '50 dòng' },
];

/** Nhóm trạng thái hiển thị: `submitted` và `scoring` đều là "đang chờ chấm". */
export const STATUS_GROUP: Record<AttemptStatus, Exclude<StatusFilterType, 'all'>> = {
    in_progress: 'in_progress',
    submitted: 'pending',
    scoring: 'pending',
    scored: 'scored',
    interrupted: 'interrupted',
};

/** Link tới trang xem lại bài; `annotationId` cuộn thẳng tới đoạn bị nhận xét. */
export const getAttemptHref = (attemptId: string, annotationId?: string) =>
    `/setting/history/${attemptId}${annotationId ? `#ann-${annotationId}` : ''}`;

/** Nút chính của một lượt làm: lượt dở dang quay lại phòng thi, còn lại mở trang xem bài. */
export function getAttemptAction({ attempt, exam }: HistoryRow) {
    switch (STATUS_GROUP[attempt.status]) {
        case 'in_progress':
            return {
                label: 'Tiếp tục làm bài',
                href: buildTestHref(exam.skill, exam.id, attempt.mode, attempt.part_template_id),
                primary: true,
            };
        case 'scored':
            return { label: 'Xem lại chi tiết', href: getAttemptHref(attempt.id), primary: true };
        case 'pending':
            return { label: 'Xem bài đã nộp', href: getAttemptHref(attempt.id), primary: false };
        default:
            return { label: 'Xem chi tiết', href: getAttemptHref(attempt.id), primary: false };
    }
}

/** Mã ngắn để người dùng nhận ra lượt làm (attempt không có cột mã riêng). */
export const getAttemptCode = (attempt: Attempt) => `#${attempt.id.slice(0, 8).toUpperCase()}`;

/** "Part 2 · Q3-4" khi luyện riêng một Part, "Cả đề" khi làm hết. */
export function getPartLabel(attempt: Attempt) {
    const template = PART_TEMPLATES.find((part) => part.id === attempt.part_template_id);
    return template ? `Part ${template.part_no} · Q${template.q_from}-${template.q_to}` : 'Cả đề';
}

const DATE_TIME = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

export const formatDateTime = (iso: string) => DATE_TIME.format(new Date(iso));

/** Thời lượng từ lúc bắt đầu tới lúc nộp; `null` khi chưa nộp. */
export function formatDuration(attempt: Attempt) {
    if (!attempt.submitted_at) return null;
    const totalSec = Math.max(0, Math.round((Date.parse(attempt.submitted_at) - Date.parse(attempt.started_at)) / 1000));
    const minutes = Math.floor(totalSec / 60);
    return `${minutes}m ${String(totalSec % 60).padStart(2, '0')}s`;
}

export const SKILL_STYLE: Record<Skill, { Icon: IconType; className: string; label: string }> = {
    speaking: { Icon: LuMic, className: 'bg-main text-sub3', label: 'Speaking' },
    writing: { Icon: LuPenLine, className: 'bg-sub3 text-main', label: 'Writing' },
};
