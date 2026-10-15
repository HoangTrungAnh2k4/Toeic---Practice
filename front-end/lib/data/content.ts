import type { Exam, ExamPart, ExamStats, Question } from '@/lib/domain/types';
import { getPartTemplates } from '@/lib/domain/parts';
import { PART_CONTEXTS, QUESTION_SEEDS } from './mock-questions';

/**
 * Nội dung dùng chung cho mọi người dùng (ngân hàng đề). Hiện là mock trong bộ nhớ;
 * khi có backend thay ruột từng hàm bằng query Supabase, giữ nguyên signature.
 */

const TIMESTAMP = '2026-10-01T00:00:00.000Z';

/** Field bắt buộc khi khai báo mock; phần còn lại lấy mặc định. */
type RequiredSeedKey = 'id' | 'skill' | 'code' | 'title' | 'edition' | 'source' | 'status' | 'is_verified' | 'topic';
type ExamSeed = Pick<Exam, RequiredSeedKey> & Partial<Exam>;

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
        id: 'sp-01',
        skill: 'speaking',
        code: 'ETS SP-01',
        title: 'ETS Speaking Test 01 — IT Helpdesk & Software Upgrade',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'tech',
        target_level: 7,
        description: 'Mô tả ảnh phòng kỹ thuật, trả lời lịch nâng cấp phần mềm và đề xuất giải pháp hỗ trợ từ xa.',
        tags: ['Part2-ServerRoom', 'Part4-UpgradePlan', 'Part5-RemoteSupport'],
    }),
    exam({
        id: 'sp-02',
        skill: 'speaking',
        code: 'ETS SP-02',
        title: 'ETS Speaking Test 02 — Store Opening & Sales Report',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'retail',
        target_level: 7,
        description: 'Thông báo khai trương cửa hàng, trả lời khảo sát mua sắm và đọc báo cáo doanh số theo tuần.',
        tags: ['Part1-StoreOpening', 'Part4-SalesReport', 'Part5-Opinion'],
    }),
    exam({
        id: 'sp-03',
        skill: 'speaking',
        code: 'ETS SP-03',
        title: 'ETS Speaking Test 03 — Hotel Booking & Travel Itinerary',
        edition: 2024,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'travel',
        target_level: 5,
        description: 'Đọc quảng cáo khách sạn, trả lời khảo sát thói quen du lịch và tra cứu lịch trình chuyến công tác.',
        tags: ['Part1-Advertisement', 'Part3-TravelSurvey', 'Part4-Itinerary'],
    }),
    exam({
        id: 'sp-04',
        skill: 'speaking',
        code: 'ETS SP-04',
        title: 'ETS Speaking Test 04 — Product Launch Press & Marketing',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'tech',
        target_level: 8,
        description: 'Yêu cầu tốc độ phản xạ cao, dùng chính xác thuật ngữ truyền thông thương hiệu và lập luận Part 5 phức tạp.',
        tags: ['Part4-PressRelease', 'Part5-BrandStrategy', 'HighLexical'],
    }),
    exam({
        id: 'sp-05',
        skill: 'speaking',
        code: 'ETS SP-05',
        title: 'ETS Speaking Test 05 — Retail Promotion & Schedule Inquiry',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'retail',
        target_level: 5,
        description: 'Đọc thông báo khuyến mãi, mô tả ảnh quầy hàng và trả lời câu hỏi về lịch làm việc của cửa hàng.',
        tags: ['Part1-Promotion', 'Part2-Store', 'Part4-Schedule'],
    }),
    exam({
        id: 'sp-06',
        skill: 'speaking',
        code: 'ETS SP-06',
        title: 'ETS Speaking Test 06 — Job Interview & Onboarding',
        edition: 2024,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'office',
        target_level: 7,
        description: 'Tình huống tuyển dụng nhân sự, quy trình đào tạo hội nhập nhân viên mới và kỹ năng trả lời phỏng vấn.',
        tags: ['Part1-Announcement', 'Part2-Photo', 'Part5-Opinion'],
    }),
    exam({
        id: 'sp-07',
        skill: 'speaking',
        code: 'ETS SP-07',
        title: 'ETS Speaking Test 07 — Conference & Exhibition Hosting',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'travel',
        target_level: 7,
        description: 'Thông báo hội chợ thương mại, mô tả gian hàng triển lãm và tra cứu lịch trình hội nghị.',
        tags: ['Part1-Expo', 'Part2-Booth', 'Part4-Conference'],
    }),
    exam({
        id: 'sp-08',
        skill: 'speaking',
        code: 'ETS SP-08',
        title: 'ETS Speaking Test 08 — Customer Service Hotline',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'customer',
        target_level: 5,
        description: 'Tổng đài chăm sóc khách hàng: giải thích giao hàng trễ, đổi trả sản phẩm và đề xuất cách xử lý khiếu nại.',
        tags: ['Part3-Hotline', 'Part4-Refund', 'Part5-Service'],
    }),
    exam({
        id: 'sp-09',
        skill: 'speaking',
        code: 'ETS SP-09',
        title: 'ETS Speaking Test 09 — Office Operations & Project Delays',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'office',
        target_level: 7,
        description: 'Phản xạ hội thoại công việc, xử lý thay đổi lịch trình dự án và nêu quan điểm về mô hình làm việc hybrid.',
        tags: ['Part3-DelayNotice', 'Part4-Agenda', 'Part5-HybridOffice'],
    }),
    exam({
        id: 'sp-10',
        skill: 'speaking',
        code: 'ETS SP-10',
        title: 'ETS Speaking Test 10 — Customer Service & Logistics',
        edition: 2024,
        source: 'internal',
        status: 'draft',
        is_verified: false,
        topic: 'customer',
        target_level: 7,
        review_note: 'Cần kiểm tra audio Part 4',
    }),
    exam({
        id: 'wr-01',
        skill: 'writing',
        code: 'ETS WR-01',
        title: 'ETS Writing Test 01 — Retail Promotion & Service Feedback',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'customer',
        target_level: 5,
        description: 'Viết câu theo tranh cửa hàng, trả lời email góp ý dịch vụ và nêu quan điểm về chương trình khuyến mãi.',
        tags: ['Part1-Retail', 'Part2-Feedback', 'Part3-Promotion'],
    }),
    exam({
        id: 'wr-02',
        skill: 'writing',
        code: 'ETS WR-02',
        title: 'ETS Writing Test 02 — Corporate Relocation & Policy Updates',
        edition: 2024,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'office',
        target_level: 7,
        description: 'Rèn luyện câu phức có mệnh đề quan hệ và bài luận nêu quan điểm 300 từ về chính sách đãi ngộ nhân viên.',
        tags: ['Part1-Facility', 'Part2-ScheduleChange', 'Part3-JobSatisfaction'],
    }),
    exam({
        id: 'wr-03',
        skill: 'writing',
        code: 'ETS WR-03',
        title: 'ETS Writing Test 03 — Global Trade & Vendor Relations',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'logistics',
        target_level: 7,
        description: 'Email đàm phán với nhà cung cấp, mô tả tranh cảng hàng hoá và lập luận về thương mại toàn cầu.',
        tags: ['Part1-Port', 'Part2-Vendor', 'Part3-Trade'],
    }),
    exam({
        id: 'wr-04',
        skill: 'writing',
        code: 'ETS WR-04',
        title: 'ETS Writing Test 04 — Product Launch & Logistics Inquiries',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'logistics',
        target_level: 7,
        description: 'Phản hồi yêu cầu thông tin ra mắt sản phẩm, tranh kho vận và bài luận về giao hàng nhanh.',
        tags: ['Part1-Launch', 'Part2-Inquiry', 'Part3-Delivery'],
    }),
    exam({
        id: 'wr-05',
        skill: 'writing',
        code: 'ETS WR-05',
        title: 'ETS Writing Test 05 — Customer Relations & Workplace Strategy',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'customer',
        target_level: 7,
        description: 'Viết câu theo tranh về hoạt động văn phòng, phản hồi email yêu cầu hoàn tiền và lập luận về hình thức làm việc từ xa.',
        tags: ['Part1-Office', 'Part2-EmailComplaint', 'Part3-RemoteWork'],
    }),
    exam({
        id: 'wr-06',
        skill: 'writing',
        code: 'ETS WR-06',
        title: 'ETS Writing Test 06 — Strategic Investment & ESG Governance',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'strategy',
        target_level: 8,
        description: 'Thách thức vốn từ vựng học thuật C1, yêu cầu bài luận phân tích đa chiều về trách nhiệm xã hội doanh nghiệp.',
        tags: ['HighLexical', 'ComplexGrammar', 'Essay-Policy'],
    }),
    exam({
        id: 'wr-07',
        skill: 'writing',
        code: 'ETS WR-07',
        title: 'ETS Writing Test 07 — Staff Onboarding & Training Programs',
        edition: 2024,
        source: 'ets',
        status: 'published',
        is_verified: true,
        topic: 'office',
        target_level: 5,
        description: 'Luyện câu ghép với liên từ cơ bản và email phản hồi yêu cầu sắp xếp lịch đào tạo nhân viên mới.',
        tags: ['Part1-Meeting', 'Part2-TrainingRequest', 'Part3-Mentoring'],
    }),
    exam({
        id: 'wr-08',
        skill: 'writing',
        code: 'ETS WR-08',
        title: 'ETS Writing Test 08 — Marketing Campaign & Brand Feedback',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'strategy',
        target_level: 7,
        description: 'Email phản hồi chiến dịch quảng cáo, tranh sự kiện ra mắt và bài luận về sức ảnh hưởng của mạng xã hội.',
        tags: ['Part1-Event', 'Part2-Campaign', 'Part3-SocialMedia'],
    }),
    exam({
        id: 'wr-09',
        skill: 'writing',
        code: 'ETS WR-09',
        title: 'ETS Writing Test 09 — Warehouse Operations & Shipping Delays',
        edition: 2024,
        source: 'internal',
        status: 'published',
        is_verified: true,
        topic: 'logistics',
        target_level: 5,
        description: 'Tình huống kho vận: miêu tả tranh xếp dỡ hàng, phản hồi khiếu nại giao trễ và quan điểm về tự động hoá.',
        tags: ['Part1-Warehouse', 'Part2-DeliveryDelay', 'Part3-Automation'],
    }),
    exam({
        id: 'wr-10',
        skill: 'writing',
        code: 'ETS WR-10',
        title: 'ETS Writing Test 10 — Remote Work Policy',
        edition: 2024,
        source: 'internal',
        status: 'review',
        is_verified: false,
        topic: 'office',
        target_level: 7,
        review_note: 'Chờ duyệt đề Essay Q8',
    }),
];

/** Mọi đề trong mock đều là đề đầy đủ: có đủ các Part của kỹ năng theo format ETS. */
const fullParts = ({ id, skill }: Exam): ExamPart[] =>
    getPartTemplates(skill).map((part) => ({
        id: `${id}-p${part.id}`,
        exam_id: id,
        part_template_id: part.id,
        description: null,
        context: PART_CONTEXTS[part.id] ?? null,
        context_media_path: null,
    }));

const EXAM_PARTS: ExamPart[] = EXAMS.flatMap(fullParts);

const EXAM_QUESTIONS: Question[] = EXAMS.flatMap((exam) =>
    getPartTemplates(exam.skill).flatMap((part) =>
        QUESTION_SEEDS[exam.skill]
            .filter((seed) => seed.number >= part.q_from && seed.number <= part.q_to)
            .map((seed) => ({
                id: `${exam.id}-q${seed.number}`,
                exam_part_id: `${exam.id}-p${part.id}`,
                stimulus: null,
                image_path: null,
                image_alt: null,
                audio_path: null,
                keywords: null,
                sample_answer: null,
                hint: null,
                ...seed,
            })),
    ),
);

const EXAM_STATS: ExamStats[] = [
    { exam_id: 'sp-01', attempt_count: 640, completion_rate: 89.2 },
    { exam_id: 'sp-02', attempt_count: 1210, completion_rate: 86.5 },
    { exam_id: 'sp-03', attempt_count: 2210, completion_rate: 90.1 },
    { exam_id: 'sp-04', attempt_count: 380, completion_rate: 78.4 },
    { exam_id: 'sp-05', attempt_count: 950, completion_rate: 92.3 },
    { exam_id: 'sp-06', attempt_count: 890, completion_rate: 88 },
    { exam_id: 'sp-07', attempt_count: 1420, completion_rate: 88.4 },
    { exam_id: 'sp-08', attempt_count: 1105, completion_rate: 84.7 },
    { exam_id: 'sp-09', attempt_count: 210, completion_rate: 81.9 },
    { exam_id: 'wr-01', attempt_count: 870, completion_rate: 90.6 },
    { exam_id: 'wr-02', attempt_count: 1675, completion_rate: 87.3 },
    { exam_id: 'wr-03', attempt_count: 540, completion_rate: 83.2 },
    { exam_id: 'wr-04', attempt_count: 760, completion_rate: 85.1 },
    { exam_id: 'wr-05', attempt_count: 982, completion_rate: 91.2 },
    { exam_id: 'wr-06', attempt_count: 312, completion_rate: 74.8 },
    { exam_id: 'wr-07', attempt_count: 1330, completion_rate: 93.4 },
    { exam_id: 'wr-08', attempt_count: 605, completion_rate: 86 },
    { exam_id: 'wr-09', attempt_count: 180, completion_rate: 82.5 },
];

export async function listExams(): Promise<Exam[]> {
    return EXAMS;
}

export async function getExam(id: string): Promise<Exam | null> {
    return EXAMS.find((exam) => exam.id === id) ?? null;
}

/** Bỏ trống `examId` để lấy Part của mọi đề. */
export async function listExamParts(examId?: string): Promise<ExamPart[]> {
    return examId ? EXAM_PARTS.filter((part) => part.exam_id === examId) : EXAM_PARTS;
}

/** Câu hỏi của một đề, theo thứ tự số câu. */
export async function listQuestions(examId: string): Promise<Question[]> {
    const partIds = new Set(EXAM_PARTS.filter((part) => part.exam_id === examId).map((part) => part.id));
    return EXAM_QUESTIONS.filter((question) => partIds.has(question.exam_part_id)).sort((a, b) => a.number - b.number);
}

export async function listExamStats(): Promise<ExamStats[]> {
    return EXAM_STATS;
}
