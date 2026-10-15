import type { LibraryTab, Option, ProgressFilter, TargetFilter, TopicFilter } from './types';

export const PAGE_SIZE = 6;

export const TAB_OPTIONS: Option<LibraryTab>[] = [
    { value: 'all', label: 'Tất cả đề' },
    { value: 'retake', label: 'Làm lại' },
    { value: 'bookmark', label: 'Đã đánh dấu' },
];

export const TARGET_OPTIONS: Option<TargetFilter>[] = [
    { value: 'all', label: 'Mục tiêu: Tất cả' },
    { value: 'level_5', label: 'Level 5 trở xuống' },
    { value: 'level_6_7', label: 'Level 6 - 7' },
    { value: 'level_8', label: 'Level 8 trở lên' },
];

export const STATUS_OPTIONS: Option<ProgressFilter>[] = [
    { value: 'all', label: 'Trạng thái: Tất cả' },
    { value: 'not_started', label: 'Chưa làm' },
    { value: 'in_progress', label: 'Đang làm dở' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

export const TOPIC_OPTIONS: Option<TopicFilter>[] = [
    { value: 'all', label: 'Chủ đề: Tất cả lĩnh vực' },
    { value: 'office', label: 'Workplace & Office' },
    { value: 'customer', label: 'Customer Service' },
    { value: 'retail', label: 'Retail & Sales' },
    { value: 'travel', label: 'Travel & Hospitality' },
    { value: 'tech', label: 'Technology & Media' },
    { value: 'logistics', label: 'Logistics & Supply' },
    { value: 'strategy', label: 'Business Strategy' },
];
