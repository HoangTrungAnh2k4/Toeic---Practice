import type { LibraryTab, Option, ProgressFilter } from './types';

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
