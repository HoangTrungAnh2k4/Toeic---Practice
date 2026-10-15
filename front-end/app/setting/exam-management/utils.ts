import { ExamLibraryItem, ExamSkill, LibraryTab, Option, SourceFilter, StatusFilter } from './types';

export const EXAM_LIBRARY_ID = 'exam-library';

export const LIBRARY_TABS: Option<LibraryTab>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
];

export const STATUS_FILTER_OPTIONS: Option<StatusFilter>[] = [
    { value: 'all', label: 'Mọi trạng thái' },
    { value: 'published', label: 'Đang khả dụng' },
    { value: 'review', label: 'Chờ thẩm định' },
    { value: 'draft', label: 'Bản nháp' },
];

export const SOURCE_FILTER_OPTIONS: Option<SourceFilter>[] = [
    { value: 'all', label: 'Mọi nguồn dữ liệu' },
    { value: 'ets', label: 'ETS chính thức' },
    { value: 'internal', label: 'Biên soạn nội bộ' },
];

/** Phòng thi dùng để xem trước theo kỹ năng của đề. */
export const PREVIEW_HREF: Record<ExamSkill, string> = {
    speaking: '/speaking/test',
    writing: '/writing/test',
};

export function formatCount(value: number): string {
    return value.toLocaleString('vi-VN');
}

export function getTabCounts(exams: ExamLibraryItem[]): Record<LibraryTab, number> {
    return {
        all: exams.length,
        speaking: exams.filter((exam) => exam.skill === 'speaking').length,
        writing: exams.filter((exam) => exam.skill === 'writing').length,
    };
}

export interface ExamFilters {
    tab: LibraryTab;
    search: string;
    status: StatusFilter;
    source: SourceFilter;
}

export const DEFAULT_EXAM_FILTERS: ExamFilters = { tab: 'all', search: '', status: 'all', source: 'all' };

export function filterExams(exams: ExamLibraryItem[], { tab, search, status, source }: ExamFilters): ExamLibraryItem[] {
    const keyword = search.trim().toLowerCase();

    return exams.filter((exam) => {
        if (tab !== 'all' && exam.skill !== tab) return false;
        if (status !== 'all' && exam.status !== status) return false;
        if (source !== 'all' && exam.source !== source) return false;
        if (!keyword) return true;
        const fields = [exam.code, exam.title, exam.review_note ?? ''];
        return fields.some((field) => field.toLowerCase().includes(keyword));
    });
}
