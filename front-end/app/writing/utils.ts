import {
    LuCircleAlert,
    LuClock,
    LuFileText,
    LuHourglass,
    LuListChecks,
    LuListOrdered,
    LuMail,
    LuSend,
    LuSpellCheck,
} from 'react-icons/lu';
import {
    FreshWritingTest,
    Option,
    PartStrategy,
    RubricPart,
    TargetFilterType,
    TestStatusFilterType,
    TopicFilterType,
    WritingTabType,
    WritingTest,
} from './types';

export const PAGE_SIZE = 6;

export const WRITING_TEST_PATH = '/writing/test';

export const MOCK_WRITING_TESTS: WritingTest[] = [
    {
        id: 'wr-05',
        code: 'ETS WR-05',
        kind: 'fresh',
        title: 'ETS Writing Test 05 — Customer Relations & Workplace Strategy',
        topic: 'customer',
        target: 'level_7_8',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: true,
        isRecommended: true,
        badge: 'Đề mới',
        badgeTone: 'main',
        highlight: 'Chuẩn CBT',
        highlightType: 'cbt',
        tags: ['Part1-Office', 'Part2-EmailComplaint', 'Part3-RemoteWork'],
        description:
            'Viết câu theo tranh về hoạt động văn phòng, phản hồi email yêu cầu hoàn tiền và lập luận về hình thức làm việc từ xa.',
        summary: 'Target 160+ · 8 câu · 60 phút',
        statusLabel: 'Chưa làm',
    },
    {
        id: 'wr-04',
        code: 'ETS WR-04',
        kind: 'attempted',
        title: 'ETS Writing Test 04 — Product Launch & Logistics Inquiries',
        topic: 'logistics',
        target: 'level_7_8',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        attemptCount: 1,
        lastAttemptAt: '2 ngày trước',
        score: 145,
        level: 'Level 7',
        weakness: 'Yếu Q7 (Email 2)',
        aiNote: 'Đạt trọn vẹn ngữ pháp Part 1, nhưng Email Part 2 thiếu câu đề xuất phương án thay thế.',
        metrics: [
            { label: 'Ngữ pháp', value: '92%' },
            { label: 'Task Comp.', value: '75/100' },
            { label: 'Bản lưu', value: 'Đầy đủ' },
        ],
    },
    {
        id: 'wr-03',
        code: 'ETS WR-03',
        kind: 'in_progress',
        title: 'ETS Writing Test 03 — Global Trade & Vendor Relations',
        topic: 'logistics',
        target: 'level_7_8',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: true,
        stoppedAt: 'Dừng ở Q06 (Part 2 — Email 1)',
        savedNote: 'Đã hoàn thành 5/5 câu Part 1, lưu an toàn trong bộ nhớ máy.',
        answered: 5,
        totalQuestions: 8,
        timeRemaining: '38:40',
    },
    {
        id: 'wr-02',
        code: 'ETS WR-02',
        kind: 'fresh',
        title: 'ETS Writing Test 02 — Corporate Relocation & Policy Updates',
        topic: 'office',
        target: 'level_7_8',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        badge: 'Chuẩn ETS 2024',
        badgeTone: 'neutral',
        highlight: '4.8 (720 lượt)',
        highlightType: 'rating',
        tags: ['Part1-Facility', 'Part2-ScheduleChange', 'Part3-JobSatisfaction'],
        description:
            'Rèn luyện câu phức có mệnh đề quan hệ và bài luận nêu quan điểm 300 từ về chính sách đãi ngộ nhân viên.',
        summary: 'Target 150-170 · 8 câu · 60 phút',
        statusLabel: 'Hoàn thành 91%',
    },
    {
        id: 'wr-01',
        code: 'ETS WR-01',
        kind: 'guided',
        title: 'ETS Writing Test 01 — Retail Promotion & Service Feedback',
        topic: 'customer',
        target: 'level_5_6',
        isCbt: false,
        supportsPartPractice: true,
        isBookmarked: true,
        features: [
            'Gợi ý cấu trúc câu & dàn ý Email',
            'Bài mẫu điểm 200/200 của giám khảo',
            'Kiểm tra lỗi ngữ pháp ngay khi gõ',
        ],
        summary: 'Trung cấp · Không giới hạn thời gian',
        statusLabel: 'Hỗ trợ AI 100%',
    },
    {
        id: 'wr-06',
        code: 'ETS WR-06',
        kind: 'fresh',
        title: 'ETS Writing Test 06 — Strategic Investment & ESG Governance',
        topic: 'strategy',
        target: 'level_8_max',
        isCbt: true,
        supportsPartPractice: false,
        isBookmarked: true,
        badge: 'Nâng cao 170-200',
        badgeTone: 'sub3',
        highlight: 'Độ khó 9/10',
        highlightType: 'difficulty',
        tags: ['HighLexical', 'ComplexGrammar', 'Essay-Policy'],
        description:
            'Thách thức vốn từ vựng học thuật C1, yêu cầu bài luận phân tích đa chiều về trách nhiệm xã hội doanh nghiệp.',
        summary: 'Target 180+ · 8 câu · 60 phút',
        statusLabel: 'Chưa làm',
    },
    {
        id: 'wr-07',
        code: 'ETS WR-07',
        kind: 'fresh',
        title: 'ETS Writing Test 07 — Staff Onboarding & Training Programs',
        topic: 'office',
        target: 'level_5_6',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        badge: 'Chuẩn ETS 2024',
        badgeTone: 'neutral',
        highlight: '4.6 (512 lượt)',
        highlightType: 'rating',
        tags: ['Part1-Meeting', 'Part2-TrainingRequest', 'Part3-Mentoring'],
        description: 'Luyện câu ghép với liên từ cơ bản và email phản hồi yêu cầu sắp xếp lịch đào tạo nhân viên mới.',
        summary: 'Target 110-130 · 8 câu · 60 phút',
        statusLabel: 'Chưa làm',
    },
    {
        id: 'wr-08',
        code: 'ETS WR-08',
        kind: 'attempted',
        title: 'ETS Writing Test 08 — Marketing Campaign & Brand Feedback',
        topic: 'strategy',
        target: 'level_7_8',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        attemptCount: 2,
        lastAttemptAt: '1 tuần trước',
        score: 160,
        level: 'Level 7',
        weakness: 'Yếu Q8 (Essay)',
        aiNote: 'Email đủ 3 yêu cầu, nhưng bài luận thiếu ví dụ minh chứng ở đoạn thân bài thứ hai.',
        metrics: [
            { label: 'Ngữ pháp', value: '88%' },
            { label: 'Task Comp.', value: '82/100' },
            { label: 'Bản lưu', value: 'Đầy đủ' },
        ],
    },
    {
        id: 'wr-09',
        code: 'ETS WR-09',
        kind: 'fresh',
        title: 'ETS Writing Test 09 — Warehouse Operations & Shipping Delays',
        topic: 'logistics',
        target: 'level_5_6',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        badge: 'Đề mới',
        badgeTone: 'main',
        highlight: 'Chuẩn CBT',
        highlightType: 'cbt',
        tags: ['Part1-Warehouse', 'Part2-DeliveryDelay', 'Part3-Automation'],
        description: 'Tình huống kho vận: miêu tả tranh xếp dỡ hàng, phản hồi khiếu nại giao trễ và quan điểm về tự động hoá.',
        summary: 'Target 120+ · 8 câu · 60 phút',
        statusLabel: 'Chưa làm',
    },
];

export const RECOMMENDED_TEST = MOCK_WRITING_TESTS.find(
    (test): test is FreshWritingTest => test.kind === 'fresh' && Boolean(test.isRecommended),
);

export const TAB_OPTIONS: Option<WritingTabType>[] = [
    { value: 'all', label: 'Tất cả đề' },
    { value: 'cbt', label: 'Thi thử CBT (60 phút)' },
    { value: 'by_part', label: 'Luyện theo Part' },
    { value: 'retake', label: 'Làm lại / Sửa lỗi' },
    { value: 'bookmark', label: 'Đã đánh dấu' },
];

export const TARGET_OPTIONS: Option<TargetFilterType>[] = [
    { value: 'all', label: 'Mục tiêu: Tất cả' },
    { value: 'level_5_6', label: '110 - 130 (Level 5-6)' },
    { value: 'level_7_8', label: '140 - 170 (Level 7-8)' },
    { value: 'level_8_max', label: '180 - 200 (Level 8 Max)' },
];

export const STATUS_OPTIONS: Option<TestStatusFilterType>[] = [
    { value: 'all', label: 'Trạng thái: Tất cả' },
    { value: 'not_started', label: 'Chưa làm' },
    { value: 'in_progress', label: 'Đang làm dở' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

export const TOPIC_OPTIONS: Option<TopicFilterType>[] = [
    { value: 'all', label: 'Chủ đề: Tất cả lĩnh vực' },
    { value: 'customer', label: 'Customer Support & Feedback' },
    { value: 'office', label: 'Office Operations & HR' },
    { value: 'logistics', label: 'Logistics, Shipping & Orders' },
    { value: 'strategy', label: 'Corporate Strategy & Marketing' },
];

export const PART_STRATEGIES: PartStrategy[] = [
    {
        part: 'Part 1: Viết câu theo tranh',
        timing: 'Q1–5 · 8 phút',
        formula: 'Công thức vàng: S + V + O + Conjunction + S + V + O',
        tips: [
            {
                icon: LuCircleAlert,
                title: 'Chỉ viết ĐÚNG 1 câu duy nhất',
                description:
                    'Hai câu tách bằng dấu chấm sẽ bị trừ điểm cấu trúc. Hãy dùng liên từ (because, although, while, so) hoặc phân từ (-ing/-ed).',
            },
            {
                icon: LuSpellCheck,
                title: 'Biến đổi dạng từ linh hoạt',
                description:
                    'ETS cho phép chia thì, đổi danh từ số nhiều, đổi dạng động từ. Đừng ép dùng nguyên mẫu nếu sai ngữ pháp.',
            },
            {
                icon: LuHourglass,
                title: 'Phân bổ 8 phút hợp lý',
                description: 'Dành 1–1.5 phút/câu, chừa 1–2 phút cuối để soát chính tả và mạo từ (a/an/the).',
            },
        ],
    },
    {
        part: 'Part 2: Phản hồi Email',
        timing: 'Q6–7 · 10 phút/câu',
        formula: 'Checklist: 2 câu hỏi đáp + 1 giải pháp hỗ trợ',
        tips: [
            {
                icon: LuListChecks,
                title: 'Đếm đủ số yêu cầu',
                description:
                    'Mỗi email có 2–3 yêu cầu cụ thể. Quên 1 ý sẽ hạ trần Task Completion từ 4 xuống 2 điểm.',
            },
            {
                icon: LuMail,
                title: 'Format văn phong thương mại',
                description:
                    'Đủ Greeting (Dear...), Opening (Thank you for your email regarding...), Body giải quyết từng yêu cầu và Closing (Sincerely, ...).',
            },
            {
                icon: LuSend,
                title: 'Nút điều hướng không gửi thư thật',
                description: 'Các nút trong phòng thi chỉ chuyển câu. Hãy tập trung hoàn toàn vào nội dung văn bản.',
            },
        ],
    },
    {
        part: 'Part 3: Bài luận quan điểm',
        timing: 'Q8 · 30 phút · 300+ từ',
        formula: 'Khung OREO: Opinion → Reason → Example → Opinion',
        tips: [
            {
                icon: LuFileText,
                title: 'Cấu trúc 4 đoạn chuẩn mực',
                description:
                    'Intro (Paraphrase + Thesis) → Body 1 (Lý do + Ví dụ) → Body 2 (Lý do + Phân tích) → Conclusion.',
            },
            {
                icon: LuListOrdered,
                title: 'Mốc 300 từ không phải giới hạn cứng',
                description:
                    'Bài 260–280 từ ngữ pháp chuẩn, lập luận sâu vẫn có thể đạt 4–5 điểm. Chất lượng quan trọng hơn độ dài.',
            },
            {
                icon: LuClock,
                title: 'Phân bổ 30 phút theo tỷ lệ 5 - 20 - 5',
                description: '5 phút lập dàn ý → 20 phút viết tập trung → 5 phút soát lỗi thì & danh từ số nhiều.',
            },
        ],
    },
];

export const RUBRIC_PARTS: RubricPart[] = [
    {
        part: 'Part 1 · Q1–5',
        timing: '8 phút (dùng chung)',
        task: 'Write a sentence based on a picture',
        prompt: '1 bức ảnh kèm 2 từ/cụm từ cho sẵn.',
        requirement: 'Viết 1 câu duy nhất dùng cả 2 từ khóa và miêu tả đúng bức tranh.',
        criteria: 'Ngữ pháp chuẩn xác, liên kết tự nhiên, không sai chính tả.',
    },
    {
        part: 'Part 2 · Q6–7',
        timing: '10 phút / câu',
        task: 'Respond to a written request',
        prompt: '1 email từ đối tác, khách hàng hoặc đồng nghiệp.',
        requirement: 'Viết email phản hồi giải quyết đầy đủ 2–3 yêu cầu trong đề.',
        criteria: 'Chất lượng câu chữ, đủ yêu cầu, giọng điệu chuyên nghiệp.',
    },
    {
        part: 'Part 3 · Q8',
        timing: '30 phút',
        task: 'Write an opinion essay',
        prompt: 'Một vấn đề xã hội hoặc quản trị doanh nghiệp cần nêu quan điểm.',
        requirement: 'Viết ít nhất 300 từ, có lập luận và ví dụ bảo vệ quan điểm.',
        criteria: 'Lập luận mạch lạc, tổ chức đoạn, từ vựng phong phú, ngữ pháp chính xác.',
    },
];
