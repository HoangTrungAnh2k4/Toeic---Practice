import type { Exam, ExamPart, ExamStats, Skill } from '@/lib/domain/types';
import { getPartTemplates } from '@/lib/domain/parts';

/**
 * Nội dung dùng chung cho mọi người dùng (ngân hàng đề). Hiện là mock trong bộ nhớ;
 * khi có backend thay ruột từng hàm bằng query Supabase, giữ nguyên signature.
 */

const TIMESTAMP = '2026-10-01T00:00:00.000Z';

type ExamSeed = Pick<Exam, 'id' | 'code' | 'title' | 'edition' | 'source' | 'status' | 'is_verified' | 'topic'> &
    Partial<Exam>;

const exam = (seed: ExamSeed): Exam => ({
    target_level: null,
    description: null,
    tags: [],
    review_note: null,
    created_by: null,
    published_at: seed.status === 'published' ? TIMESTAMP : null,
    created_at: TIMESTAMP,
    updated_at: TIMESTAMP,
    ...seed,
});

const EXAMS: Exam[] = [
    exam({
        id: 'spk-07',
        code: 'SW-ETS-2024-SPK07',
        title: 'ETS Speaking Test 07 — Conference & Exhibition',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'travel',
    }),
    exam({
        id: 'wrt-05',
        code: 'SW-ETS-2024-WRT05',
        title: 'ETS Writing Test 05 — Corporate Sustainability',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'strategy',
    }),
    exam({
        id: 'combo-04',
        code: 'SW-MOCK-COMBO-04',
        title: 'Combo Full Mock Test 04 — ETS International Standard',
        edition: 2024,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'office',
    }),
    exam({
        id: 'spk-09',
        code: 'SW-ETS-2024-SPK09',
        title: 'ETS Speaking Test 09 — Customer Service & Logistics',
        edition: 2024,
        source: 'internal',
        status: 'draft',
        is_verified: false,
        topic: 'customer',
        review_note: 'Cần kiểm tra audio Part 4',
    }),
    exam({
        id: 'wrt-06',
        code: 'SW-ETS-2024-WRT06',
        title: 'ETS Writing Test 06 — Remote Work Policy',
        edition: 2024,
        source: 'internal',
        status: 'review',
        is_verified: false,
        topic: 'office',
        review_note: 'Chờ duyệt đề Essay Q8',
    }),
    exam({
        id: 'spk-03',
        code: 'SW-ETS-2023-SPK03',
        title: 'ETS Speaking Test 03 — Travel & Hospitality',
        edition: 2023,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'travel',
    }),
    exam({
        id: 'wrt-02',
        code: 'SW-ETS-2024-WRT02',
        title: 'ETS Writing Test 02 — Retail & Customer Feedback',
        edition: 2024,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'customer',
    }),
    exam({
        id: 'combo-05',
        code: 'SW-MOCK-COMBO-05',
        title: 'Combo Full Mock Test 05 — Hiring & Human Resources',
        edition: 2024,
        source: 'internal',
        status: 'draft',
        is_verified: false,
        topic: 'office',
        review_note: 'Thiếu ảnh Writing Q3',
    }),
];

/** Mọi đề trong mock đều là đề đầy đủ: mỗi kỹ năng có đủ các Part theo format ETS. */
const fullParts = (examId: string, skills: Skill[]): ExamPart[] =>
    skills.flatMap((skill) =>
        getPartTemplates(skill).map((part) => ({
            id: `${examId}-p${part.id}`,
            exam_id: examId,
            part_template_id: part.id,
            description: null,
            context: null,
            context_media_path: null,
        })),
    );

const EXAM_PARTS: ExamPart[] = [
    ...fullParts('spk-07', ['speaking']),
    ...fullParts('wrt-05', ['writing']),
    ...fullParts('combo-04', ['speaking', 'writing']),
    ...fullParts('spk-09', ['speaking']),
    ...fullParts('wrt-06', ['writing']),
    ...fullParts('spk-03', ['speaking']),
    ...fullParts('wrt-02', ['writing']),
    ...fullParts('combo-05', ['speaking', 'writing']),
];

const EXAM_STATS: ExamStats[] = [
    { exam_id: 'spk-07', attempt_count: 1420, completion_rate: 88.4 },
    { exam_id: 'wrt-05', attempt_count: 982, completion_rate: 91.2 },
    { exam_id: 'combo-04', attempt_count: 3115, completion_rate: 85 },
    { exam_id: 'spk-03', attempt_count: 2210, completion_rate: 90.1 },
    { exam_id: 'wrt-02', attempt_count: 1675, completion_rate: 87.3 },
];

export async function listExams(): Promise<Exam[]> {
    return EXAMS;
}

export async function listExamParts(): Promise<ExamPart[]> {
    return EXAM_PARTS;
}

export async function listExamStats(): Promise<ExamStats[]> {
    return EXAM_STATS;
}
