import {
    LuAudioLines,
    LuClock,
    LuImage,
    LuListChecks,
    LuMessageCircleQuestion,
    LuNotebookPen,
    LuRepeat2,
    LuSpeech,
    LuTimer,
} from 'react-icons/lu';
import {
    FreshSpeakingTest,
    Option,
    PartStrategy,
    RubricPart,
    SpeakingTabType,
    SpeakingTest,
    TargetFilterType,
    TestStatusFilterType,
    TopicFilterType,
} from './types';

export const PAGE_SIZE = 6;

/** Route phòng thi Speaking. */
export const SPEAKING_TEST_PATH = '/speaking/test';

export function buildSpeakingTestHref(testId: string) {
    return `${SPEAKING_TEST_PATH}?id=${encodeURIComponent(testId)}`;
}

export const MOCK_SPEAKING_TESTS: SpeakingTest[] = [
    {
        id: 'sp-09',
        code: 'ETS SP-09',
        kind: 'fresh',
        title: 'ETS Speaking Test 09 — Office Operations & Project Delays',
        topic: 'office',
        target: 'level_6_7',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        isRecommended: true,
        badge: 'Đề mới',
        badgeTone: 'main',
        highlight: 'Chuẩn CBT',
        highlightType: 'cbt',
        tags: ['Part3-DelayNotice', 'Part4-Agenda', 'Part5-HybridOffice'],
        description:
            'Phản xạ hội thoại công việc, xử lý thay đổi lịch trình dự án và nêu quan điểm về mô hình làm việc hybrid.',
        summary: 'Target 160+ · 11 câu · 20 phút',
        statusLabel: 'Chưa làm',
    },
    {
        id: 'sp-08',
        code: 'ETS SP-08',
        kind: 'attempted',
        title: 'ETS Speaking Test 08 — Customer Service Hotline',
        topic: 'customer',
        target: 'level_5',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: true,
        attemptCount: 1,
        lastAttemptAt: '3 ngày trước',
        score: 130,
        level: 'Level 5',
        weakness: 'Yếu Q6 (Part 3)',
        aiNote: 'Giải thích giao hàng trễ bị ngập ngừng 2.1s, thiếu từ nối nguyên nhân (due to, consequently).',
        metrics: [
            { label: 'Độ chính xác', value: '68%' },
            { label: 'Phát âm', value: '72/100' },
            { label: 'Bản ghi âm', value: 'Đầy đủ' },
        ],
    },
    {
        id: 'sp-07',
        code: 'ETS SP-07',
        kind: 'in_progress',
        title: 'ETS Speaking Test 07 — Conference & Exhibition Hosting',
        topic: 'travel',
        target: 'level_6_7',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        stoppedAt: 'Dừng ở Q04 (Part 2 — Mô tả ảnh)',
        savedNote: 'Bản ghi âm Q01–Q03 đã lưu an toàn trong bộ nhớ máy.',
        answered: 3,
        totalQuestions: 11,
        timeRemaining: '14:20',
    },
    {
        id: 'sp-06',
        code: 'ETS SP-06',
        kind: 'fresh',
        title: 'ETS Speaking Test 06 — Job Interview & Onboarding',
        topic: 'office',
        target: 'level_6_7',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: true,
        badge: 'Chuẩn ETS 2024',
        badgeTone: 'neutral',
        highlight: 'Chuẩn CBT',
        highlightType: 'cbt',
        tags: ['Part1-Announcement', 'Part2-Photo', 'Part5-Opinion'],
        description:
            'Tình huống tuyển dụng nhân sự, quy trình đào tạo hội nhập nhân viên mới và kỹ năng trả lời phỏng vấn.',
        summary: 'Target 140-170 · 11 câu · 20 phút',
        statusLabel: 'Hoàn thành 94%',
    },
    {
        id: 'sp-05',
        code: 'ETS SP-05',
        kind: 'guided',
        title: 'ETS Speaking Test 05 — Retail Promotion & Schedule Inquiry',
        topic: 'retail',
        target: 'level_5',
        isCbt: false,
        supportsPartPractice: true,
        isBookmarked: true,
        features: [
            'Gợi ý dàn ý ý tưởng trước khi nói',
            'Bài nói mẫu 200/200 của người bản xứ',
            'Cho phép thu âm lại nhiều lần',
        ],
        summary: 'Trung cấp · Không giới hạn thu âm',
        statusLabel: 'Hỗ trợ AI 100%',
    },
    {
        id: 'sp-04',
        code: 'ETS SP-04',
        kind: 'fresh',
        title: 'ETS Speaking Test 04 — Product Launch Press & Marketing',
        topic: 'tech',
        target: 'level_8',
        isCbt: true,
        supportsPartPractice: false,
        isBookmarked: false,
        badge: 'Nâng cao 170-200',
        badgeTone: 'sub3',
        highlight: 'Độ khó 9/10',
        highlightType: 'difficulty',
        tags: ['Part4-PressRelease', 'Part5-BrandStrategy', 'HighLexical'],
        description:
            'Yêu cầu tốc độ phản xạ cao, dùng chính xác thuật ngữ truyền thông thương hiệu và lập luận Part 5 phức tạp.',
        summary: 'Target 170+ · 11 câu · 20 phút',
        statusLabel: 'Chưa làm',
    },
    {
        id: 'sp-03',
        code: 'ETS SP-03',
        kind: 'fresh',
        title: 'ETS Speaking Test 03 — Hotel Booking & Travel Itinerary',
        topic: 'travel',
        target: 'level_5',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        badge: 'Chuẩn ETS 2024',
        badgeTone: 'neutral',
        highlight: 'Chuẩn CBT',
        highlightType: 'cbt',
        tags: ['Part1-Advertisement', 'Part3-TravelSurvey', 'Part4-Itinerary'],
        description: 'Đọc quảng cáo khách sạn, trả lời khảo sát thói quen du lịch và tra cứu lịch trình chuyến công tác.',
        summary: 'Target 110-130 · 11 câu · 20 phút',
        statusLabel: 'Chưa làm',
    },
    {
        id: 'sp-02',
        code: 'ETS SP-02',
        kind: 'attempted',
        title: 'ETS Speaking Test 02 — Store Opening & Sales Report',
        topic: 'retail',
        target: 'level_6_7',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: false,
        attemptCount: 2,
        lastAttemptAt: '1 tuần trước',
        score: 150,
        level: 'Level 6',
        weakness: 'Yếu Q11 (Opinion)',
        aiNote: 'Phát âm rõ ràng, nhưng Q11 thiếu ví dụ cá nhân và kết luận bị cắt do hết giờ.',
        metrics: [
            { label: 'Độ chính xác', value: '81%' },
            { label: 'Phát âm', value: '84/100' },
            { label: 'Bản ghi âm', value: 'Đầy đủ' },
        ],
    },
    {
        id: 'sp-01',
        code: 'ETS SP-01',
        kind: 'fresh',
        title: 'ETS Speaking Test 01 — IT Helpdesk & Software Upgrade',
        topic: 'tech',
        target: 'level_6_7',
        isCbt: true,
        supportsPartPractice: true,
        isBookmarked: true,
        badge: 'Đề mới',
        badgeTone: 'main',
        highlight: 'Chuẩn CBT',
        highlightType: 'cbt',
        tags: ['Part2-ServerRoom', 'Part4-UpgradePlan', 'Part5-RemoteSupport'],
        description: 'Mô tả ảnh phòng kỹ thuật, trả lời lịch nâng cấp phần mềm và đề xuất giải pháp hỗ trợ từ xa.',
        summary: 'Target 150+ · 11 câu · 20 phút',
        statusLabel: 'Chưa làm',
    },
];

export const RECOMMENDED_TEST = MOCK_SPEAKING_TESTS.find(
    (test): test is FreshSpeakingTest => test.kind === 'fresh' && Boolean(test.isRecommended),
);

export const TAB_OPTIONS: Option<SpeakingTabType>[] = [
    { value: 'all', label: 'Tất cả đề' },
    { value: 'cbt', label: 'Thi thử CBT (20 phút)' },
    { value: 'by_part', label: 'Luyện theo Part' },
    { value: 'retake', label: 'Làm lại / Sửa phát âm' },
    { value: 'bookmark', label: 'Đã đánh dấu' },
];

export const TARGET_OPTIONS: Option<TargetFilterType>[] = [
    { value: 'all', label: 'Mục tiêu: Tất cả' },
    { value: 'level_5', label: '110 - 130 (Level 5)' },
    { value: 'level_6_7', label: '140 - 160 (Level 6-7)' },
    { value: 'level_8', label: '170 - 200 (Level 8)' },
];

export const STATUS_OPTIONS: Option<TestStatusFilterType>[] = [
    { value: 'all', label: 'Trạng thái: Tất cả' },
    { value: 'not_started', label: 'Chưa làm' },
    { value: 'in_progress', label: 'Đang làm dở' },
    { value: 'completed', label: 'Đã hoàn thành' },
];

export const TOPIC_OPTIONS: Option<TopicFilterType>[] = [
    { value: 'all', label: 'Chủ đề: Tất cả lĩnh vực' },
    { value: 'office', label: 'Workplace & Office' },
    { value: 'customer', label: 'Customer Service' },
    { value: 'retail', label: 'Retail & Sales' },
    { value: 'travel', label: 'Travel & Hospitality' },
    { value: 'tech', label: 'Technology & Media' },
];

export const PART_STRATEGIES: PartStrategy[] = [
    {
        part: 'Q1–4: Đọc & mô tả ảnh',
        timing: 'Chuẩn bị 45s / 30s',
        formula: 'Mô tả ảnh: Tổng quan → Người/vật chính → Chi tiết phụ → Cảm nhận',
        tips: [
            {
                icon: LuAudioLines,
                title: 'Nhấn trọng âm & ngắt nghỉ',
                description:
                    'Đánh dấu chỗ ngắt sau dấu phẩy, lên giọng ở danh sách liệt kê và xuống giọng ở cuối câu trần thuật.',
            },
            {
                icon: LuImage,
                title: 'Dùng thì hiện tại tiếp diễn',
                description: 'Ưu tiên "A man is ...ing" và cụm giới từ vị trí (in the foreground, on the left).',
            },
        ],
    },
    {
        part: 'Q5–10: Trả lời câu hỏi',
        timing: 'Phản hồi 15s – 30s',
        formula: 'Trả lời: Answer trực tiếp → Lý do → Ví dụ ngắn',
        tips: [
            {
                icon: LuMessageCircleQuestion,
                title: 'Paraphrase câu hỏi để mở đầu',
                description: 'Lặp lại cấu trúc câu hỏi giúp vào ý ngay, giảm ngập ngừng ở 2 giây đầu.',
            },
            {
                icon: LuListChecks,
                title: 'Đọc bảng thông tin chính xác',
                description: 'Q8-10 trả lời đúng số liệu, giờ, địa điểm; Q10 cần nêu đủ tất cả mục liên quan.',
            },
        ],
    },
    {
        part: 'Q11: Nêu quan điểm',
        timing: 'Chuẩn bị 45s · Nói 60s',
        formula: 'Khung PREP: Point → Reason → Example → Point',
        tips: [
            {
                icon: LuNotebookPen,
                title: 'Ghi keyword, không ghi cả câu',
                description: 'Dùng 45 giây chuẩn bị để ghi 3–4 từ khóa cho lý do và ví dụ trên giấy nháp.',
            },
            {
                icon: LuClock,
                title: 'Kiểm soát nhịp nói 60 giây',
                description: 'Nêu quan điểm trong 10s, 40s cho lý do + ví dụ, 10s cuối để kết luận lại.',
            },
        ],
    },
];

export const SPEAKING_FORMAT_NOTES = [
    { icon: LuTimer, label: 'Ghi âm tự động sau tiếng Beep' },
    { icon: LuRepeat2, label: 'Không nghe lại câu hỏi trong thi thật' },
    { icon: LuSpeech, label: 'Chấm theo thang 0–200 · 8 Level' },
];

export const RUBRIC_PARTS: RubricPart[] = [
    {
        part: 'Part 1',
        questions: 'Q1–2',
        task: 'Read a text aloud',
        description: 'Đọc thành tiếng đoạn văn ngắn (thông báo, quảng cáo, bản tin).',
        prepTime: '45 giây',
        responseTime: '45 giây',
        criteria: 'Phát âm, ngữ điệu & trọng âm',
    },
    {
        part: 'Part 2',
        questions: 'Q3–4',
        task: 'Describe a picture',
        description: 'Mô tả chi tiết bức ảnh về hoạt động hằng ngày hoặc nơi làm việc.',
        prepTime: '45 giây',
        responseTime: '30 giây',
        criteria: 'Từ vựng, ngữ pháp, mạch lạc',
    },
    {
        part: 'Part 3',
        questions: 'Q5–7',
        task: 'Respond to questions',
        description: 'Trả lời 3 câu hỏi khảo sát về một chủ đề quen thuộc.',
        prepTime: '3 giây',
        responseTime: '15s / 15s / 30s',
        criteria: 'Nội dung liên quan, độ trôi chảy',
    },
    {
        part: 'Part 4',
        questions: 'Q8–10',
        task: 'Respond using information',
        description: 'Trả lời câu hỏi dựa trên lịch trình, bảng biểu hoặc thông báo.',
        prepTime: '45s đọc + 3s',
        responseTime: '15s / 15s / 30s',
        criteria: 'Thông tin chính xác, đầy đủ',
    },
    {
        part: 'Part 5',
        questions: 'Q11',
        task: 'Express an opinion',
        description: 'Nêu và bảo vệ quan điểm cá nhân về một vấn đề cụ thể.',
        prepTime: '45 giây',
        responseTime: '60 giây',
        criteria: 'Lập luận, ví dụ, tổ chức ý',
    },
];
