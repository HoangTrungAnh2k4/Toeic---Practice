import type { LibraryTab, Option, ProgressFilter, TopicFilter } from './types';

export const PAGE_SIZE = 6;

export const TAB_OPTIONS: Option<LibraryTab>[] = [
    { value: 'all', label: 'Tất cả đề' },
    { value: 'retake', label: 'Làm lại' },
    { value: 'bookmark', label: 'Đã đánh dấu' },
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
