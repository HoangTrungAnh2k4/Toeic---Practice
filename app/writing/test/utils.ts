import { ExamSection, PictureQuestion, RequiredKeyword, WritingDraft } from './types';

export const EXAM_TITLE = 'TOEIC Writing Practice — Set B';

/** Q1-5 dùng chung 8 phút theo chuẩn ETS. */
export const SECTION_DURATION_SECONDS = 8 * 60;

export const TIME_WARNING_SECONDS = 60;

export const TOTAL_EXAM_QUESTIONS = 8;

export const OPTIMAL_WORD_RANGE = { min: 12, max: 25 } as const;

const DRAFT_STORAGE_KEY = 'writing-test:set-b:part-1';

export const EXAM_SECTIONS: ExamSection[] = [
    { id: 'picture', label: 'Viết câu theo tranh', range: 'Q1–5' },
    { id: 'email', label: 'Phản hồi Email', range: 'Q6–7' },
    { id: 'essay', label: 'Bài luận quan điểm', range: 'Q8' },
];

export const PICTURE_QUESTIONS: PictureQuestion[] = [
    {
        id: 1,
        imageUrl:
            'https://lh3.googleusercontent.com/aida-public/AB6AXuDwPUX8_yNyufAcPYk5dQvav70d-oE92cYqvYi5uWWeYVZu3bABTPtuGQfeEFECOcMV2Q-sL1t0q6qUAB54fTW15JXysF2x_ZjTaDczevjSx6yaRESbnUX2gnitDa4UBi66U146P3QCQn-_nuy805KsknuzG_JJ_bKiLCNXfrIaVixWtaCHgz1KvEkJVokVhRUsGYpQh45xiDnsDB8bRSZvxIHzwo-iOetS2SjIksbY',
        imageAlt: 'Một người phụ nữ đứng cạnh giá sách gỗ trong thư viện, đang cầm và đọc một cuốn sách',
        keywords: [
            { word: 'read', forms: ['read', 'reads', 'reading'] },
            { word: 'bookshelf', forms: ['bookshelf', 'bookshelves'] },
        ],
    },
    {
        id: 2,
        imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=75',
        imageAlt: 'Một nhóm đồng nghiệp ngồi quanh bàn dài, làm việc trên máy tính xách tay',
        keywords: [
            { word: 'laptop', forms: ['laptop', 'laptops'] },
            { word: 'while', forms: ['while'] },
        ],
    },
    {
        id: 3,
        imageUrl: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&q=75',
        imageAlt: 'Văn phòng mở, một nhân viên ngồi trước bàn có màn hình máy tính, đồng nghiệp trò chuyện phía sau',
        keywords: [
            { word: 'monitor', forms: ['monitor', 'monitors'] },
            { word: 'next to', forms: ['next to'] },
        ],
    },
    {
        id: 4,
        imageUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=75',
        imageAlt: 'Nhà kho lớn với nhiều thùng hàng được xếp trên các kệ cao',
        keywords: [
            { word: 'box', forms: ['box', 'boxes'] },
            { word: 'stack', forms: ['stack', 'stacks', 'stacked', 'stacking'] },
        ],
    },
    {
        id: 5,
        imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=75',
        imageAlt: 'Quán cà phê với nhiều ghế trống, cây xanh lớn ở giữa và quầy pha chế phía sau',
        keywords: [
            { word: 'chair', forms: ['chair', 'chairs'] },
            { word: 'empty', forms: ['empty'] },
        ],
    },
];

export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function countWords(text: string): number {
    const trimmed = text.trim();
    return trimmed ? trimmed.split(/\s+/).length : 0;
}

/** Đếm số câu dựa trên dấu kết thúc câu — dùng để cảnh báo viết quá 1 câu ở Part 1. */
export function countSentences(text: string): number {
    return text.split(/[.!?]+(?=\s|$)/).filter((part) => part.trim()).length;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Trả về dạng từ khóa thí sinh đã dùng, hoặc `null` nếu chưa xuất hiện. */
export function findKeywordUsage(text: string, keyword: RequiredKeyword): string | null {
    for (const form of keyword.forms) {
        const pattern = new RegExp(`\\b${escapeRegExp(form).replace(/\s+/g, '\\s+')}\\b`, 'i');
        const match = text.match(pattern);
        if (match) return match[0];
    }
    return null;
}

export function loadDraft(): WritingDraft | null {
    try {
        const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
        if (!raw) return null;
        const draft = JSON.parse(raw) as WritingDraft;
        return Array.isArray(draft.answers) && typeof draft.endsAt === 'number' ? draft : null;
    } catch {
        return null;
    }
}

export function saveDraft(draft: WritingDraft): boolean {
    try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
        return true;
    } catch {
        return false;
    }
}

export function clearDraft() {
    try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
    } catch {
        // Bỏ qua: storage bị chặn thì không có gì để xóa
    }
}
