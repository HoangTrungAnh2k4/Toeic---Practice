import {
    ExamRecord,
    ExamSkill,
    LibraryTab,
    Option,
    PartContent,
    PartContentMap,
    SourceFilter,
    StatusFilter,
    StudioExam,
    StudioPart,
} from './types';

export const IMPORT_STUDIO_ID = 'import-studio';
export const EXAM_LIBRARY_ID = 'exam-library';

export const DEFAULT_STUDY4_URL = 'https://study4.com/tests/328/toeic-speaking-writing-ets-format-test-07/';

export const STUDIO_EXAM: StudioExam = {
    id: 'SW-ETS-2024-SPK07',
    title: 'ETS Speaking Test 07 — Conference & Exhibition',
    sourceLabel: 'Study4 AI Crawler',
    updatedLabel: 'Cập nhật 15 phút trước',
    questionCount: 11,
    parseSummary: 'Nhận diện 11 audio prompt, 2 ảnh Part 2 (16:9), 1 bảng lịch trình Part 4 và chuẩn hóa bộ đếm giờ IIG.',
    parts: [
        {
            id: 'p1',
            code: 'P1',
            title: 'Read a text aloud',
            summary: 'Câu 1 – 2 · Chuẩn bị 45s / Đọc 45s',
            description: 'Thí sinh đọc to hai đoạn thông báo ngắn trong bối cảnh hội chợ thương mại.',
            timing: 'Prep: 45s · Đọc: 45s / câu',
            promptLabel: 'Đoạn văn cần đọc',
            questions: [
                {
                    id: 'q1',
                    number: 1,
                    prompt: 'Welcome to the twelfth annual Riverside Business Expo. Over the next three days, you can explore more than two hundred exhibition booths, attend workshops led by industry experts, and connect with suppliers from across the region. Please wear your badge at all times and visit the information desk if you need assistance.',
                    responseSeconds: 45,
                    audioReady: true,
                    hint: 'Ngắt nhịp trước danh sách liệt kê, lên giọng ở từng mục và xuống giọng ở mục cuối.',
                },
                {
                    id: 'q2',
                    number: 2,
                    prompt: 'Attention, conference attendees. The keynote presentation on sustainable packaging, originally scheduled for Hall A, has been moved to the Grand Ballroom on the second floor. Coffee, tea, and pastries will be served in the lobby during the morning break. Thank you for your understanding.',
                    responseSeconds: 45,
                    audioReady: true,
                    hint: 'Nhấn trọng âm đúng: sustainable, originally, ballroom, pastries.',
                },
            ],
        },
        {
            id: 'p2',
            code: 'P2',
            title: 'Describe a picture',
            summary: 'Câu 3 – 4 · 2 ảnh chất lượng cao',
            description: 'Thí sinh mô tả chi tiết hai bức ảnh chụp tại khu triển lãm và hội trường.',
            timing: 'Prep: 45s · Nói: 30s / câu',
            promptLabel: 'Yêu cầu đề bài',
            questions: [
                {
                    id: 'q3',
                    number: 3,
                    prompt: 'Describe the picture in as much detail as you can.',
                    responseSeconds: 30,
                    audioReady: true,
                    media: 'Nhân viên giới thiệu sản phẩm trên máy tính bảng cho hai khách tham quan tại gian hàng triển lãm.',
                    sampleAnswer:
                        'This picture was taken at a trade show. In the middle, a woman wearing a name badge is showing a tablet to two visitors. Behind them, there are colorful banners and shelves full of product samples.',
                },
                {
                    id: 'q4',
                    number: 4,
                    prompt: 'Describe the picture in as much detail as you can.',
                    responseSeconds: 30,
                    audioReady: true,
                    media: 'Hội trường đông người, diễn giả đứng trên sân khấu cạnh màn hình trình chiếu lớn.',
                    sampleAnswer:
                        'This is a conference hall. On the stage, a speaker is giving a presentation next to a large screen. In the foreground, many attendees are sitting in rows and taking notes on their laptops.',
                },
            ],
        },
        {
            id: 'p3',
            code: 'P3',
            title: 'Respond to questions',
            summary: 'Câu 5 – 7 · Phỏng vấn qua điện thoại',
            description: 'Thí sinh trả lời 3 câu hỏi phỏng vấn trong bối cảnh nghiên cứu thói quen tiêu dùng.',
            timing: 'Prep: 3s · Q5: 15s · Q6: 15s · Q7: 30s',
            contextLabel: 'Tình huống dẫn dắt',
            context:
                'Imagine that an American marketing firm is doing research in your area. You have agreed to participate in a telephone interview about shopping habits and electronics.',
            promptLabel: 'Câu hỏi',
            questions: [
                {
                    id: 'q5',
                    number: 5,
                    prompt: 'How often do you go shopping for electronics, and where do you usually go?',
                    responseSeconds: 15,
                    audioReady: true,
                    sampleAnswer:
                        'I usually shop for electronics once or twice a year, mainly when I need to upgrade my gadgets. I prefer authorized retail chains because they offer genuine warranties.',
                },
                {
                    id: 'q6',
                    number: 6,
                    prompt: 'What is the most important factor when you decide to purchase a new smartphone?',
                    responseSeconds: 15,
                    audioReady: true,
                    sampleAnswer:
                        'For me, battery life and processing speed matter most. I use my phone for work all day, so reliable battery life and smooth multitasking come first.',
                },
                {
                    id: 'q7',
                    number: 7,
                    prompt: 'Do you prefer buying electronic products online or in local retail stores? Why?',
                    responseSeconds: 30,
                    audioReady: true,
                    sampleAnswer:
                        'I strongly prefer buying in physical stores for two reasons. First, I can try the device and check how it feels in my hand. Second, store staff can give quick demonstrations and exchange the product immediately if there is a defect.',
                    hint: 'Từ vựng gợi ý: hands-on trial, competitive pricing, after-sales service.',
                },
            ],
        },
        {
            id: 'p4',
            code: 'P4',
            title: 'Respond with provided info',
            summary: 'Câu 8 – 10 · Kèm bảng lịch trình',
            description: 'Thí sinh đọc lịch trình sự kiện và trả lời cuộc gọi hỏi thông tin của khách.',
            timing: 'Đọc: 45s · Prep: 3s · Q8: 15s · Q9: 15s · Q10: 30s',
            contextLabel: 'Bảng thông tin (hiển thị cho thí sinh)',
            context: [
                'Riverside Business Expo — Day 1 · Grand Hotel · May 14',
                '9:00 – 9:30 AM · Registration & Welcome Coffee',
                '9:30 – 10:30 AM · Keynote: The Future of Trade Shows — Laura Kim',
                '10:45 – 11:45 AM · Workshop: Digital Marketing for Exhibitors (Room 201)',
                '12:00 – 1:00 PM · Networking Lunch (Main Hall)',
                '1:15 – 2:15 PM · Panel: Supply Chain Trends — CANCELED',
                '2:30 – 3:30 PM · Workshop: Booth Design on a Budget (Room 203)',
            ].join('\n'),
            promptLabel: 'Câu hỏi của người gọi',
            questions: [
                {
                    id: 'q8',
                    number: 8,
                    prompt: 'What time does registration start, and where will the event take place?',
                    responseSeconds: 15,
                    audioReady: true,
                    sampleAnswer: 'Registration starts at 9 AM, and the expo will be held at the Grand Hotel.',
                },
                {
                    id: 'q9',
                    number: 9,
                    prompt: 'I heard there is a panel on supply chain trends in the afternoon. Is that correct?',
                    responseSeconds: 15,
                    audioReady: true,
                    sampleAnswer:
                        'I am afraid that panel has been canceled. However, you can join the booth design workshop at 2:30 in Room 203.',
                },
                {
                    id: 'q10',
                    number: 10,
                    prompt: 'Could you tell me about all the workshops scheduled for the day?',
                    responseSeconds: 30,
                    audioReady: true,
                    sampleAnswer:
                        'Sure. There are two workshops. Digital Marketing for Exhibitors runs from 10:45 to 11:45 in Room 201. Then Booth Design on a Budget starts at 2:30 in Room 203.',
                },
            ],
        },
        {
            id: 'p5',
            code: 'P5',
            title: 'Express an opinion',
            summary: 'Câu 11 · Chuẩn bị 45s / Nói 60s',
            description: 'Thí sinh nêu quan điểm cá nhân và đưa ra lý do, ví dụ cụ thể.',
            timing: 'Prep: 45s · Nói: 60s',
            promptLabel: 'Đề bài nêu quan điểm',
            questions: [
                {
                    id: 'q11',
                    number: 11,
                    prompt: 'Some people think companies should hold large in-person conferences, while others think online events are more effective. Which do you prefer and why? Give specific reasons and examples.',
                    responseSeconds: 60,
                    audioReady: true,
                    sampleAnswer:
                        'I prefer in-person conferences for two reasons. First, face-to-face meetings make networking much easier. At last year’s expo, I met a supplier during lunch and we signed a contract a month later. Second, attendees stay more focused without the distractions of working from home.',
                    hint: 'Cấu trúc PREP: Point – Reason – Example – Point trong 60 giây.',
                },
            ],
        },
    ],
};

export const EXAM_LIBRARY: ExamRecord[] = [
    {
        id: 'SW-ETS-2024-SPK07',
        title: 'ETS Speaking Test 07 — Conference & Exhibition',
        edition: 'Khảo thí v2024',
        skill: 'speaking',
        questionCount: 11,
        durationMinutes: 20,
        source: 'study4',
        sourceNote: 'Audio & hình ảnh khớp',
        isVerified: true,
        attempts: 1420,
        completionRate: 88.4,
        status: 'published',
    },
    {
        id: 'SW-ETS-2024-WRT05',
        title: 'ETS Writing Test 05 — Corporate Sustainability',
        edition: 'IIG Official Format',
        skill: 'writing',
        questionCount: 8,
        durationMinutes: 60,
        source: 'study4',
        sourceNote: 'Bao gồm 5 ảnh Part 1',
        isVerified: true,
        attempts: 982,
        completionRate: 91.2,
        status: 'published',
    },
    {
        id: 'SW-MOCK-COMBO-04',
        title: 'Combo Full Mock Test 04 — ETS International Standard',
        edition: 'Speaking + Writing liền mạch',
        skill: 'combo',
        questionCount: 19,
        durationMinutes: 80,
        source: 'ets',
        sourceNote: 'Biên soạn bởi Master Trainer',
        isVerified: true,
        attempts: 3115,
        completionRate: 85,
        status: 'published',
    },
    {
        id: 'SW-ETS-2024-SPK09',
        title: 'ETS Speaking Test 09 — Customer Service & Logistics',
        edition: 'Bản nháp chờ thẩm định',
        skill: 'speaking',
        questionCount: 11,
        durationMinutes: 20,
        source: 'study4',
        sourceNote: 'Cần kiểm tra audio Part 4',
        isVerified: false,
        attempts: 0,
        completionRate: null,
        status: 'draft',
    },
    {
        id: 'SW-ETS-2024-WRT06',
        title: 'ETS Writing Test 06 — Remote Work Policy',
        edition: 'IIG Official Format',
        skill: 'writing',
        questionCount: 8,
        durationMinutes: 60,
        source: 'study4',
        sourceNote: 'Chờ duyệt đề Essay Q8',
        isVerified: false,
        attempts: 0,
        completionRate: null,
        status: 'review',
    },
    {
        id: 'SW-ETS-2023-SPK03',
        title: 'ETS Speaking Test 03 — Travel & Hospitality',
        edition: 'Khảo thí v2023',
        skill: 'speaking',
        questionCount: 11,
        durationMinutes: 20,
        source: 'ets',
        sourceNote: 'Đề gốc ETS, audio studio',
        isVerified: true,
        attempts: 2210,
        completionRate: 90.1,
        status: 'published',
    },
    {
        id: 'SW-ETS-2024-WRT02',
        title: 'ETS Writing Test 02 — Retail & Customer Feedback',
        edition: 'IIG Official Format',
        skill: 'writing',
        questionCount: 8,
        durationMinutes: 60,
        source: 'ets',
        sourceNote: 'Đề gốc ETS, kèm rubric',
        isVerified: true,
        attempts: 1675,
        completionRate: 87.3,
        status: 'published',
    },
    {
        id: 'SW-MOCK-COMBO-05',
        title: 'Combo Full Mock Test 05 — Hiring & Human Resources',
        edition: 'Ghép từ SPK05 + WRT03',
        skill: 'combo',
        questionCount: 19,
        durationMinutes: 80,
        source: 'study4',
        sourceNote: 'Thiếu ảnh Writing Q3',
        isVerified: false,
        attempts: 0,
        completionRate: null,
        status: 'draft',
    },
];

export const LIBRARY_TABS: Option<LibraryTab>[] = [
    { value: 'all', label: 'Tất cả' },
    { value: 'speaking', label: 'Speaking' },
    { value: 'writing', label: 'Writing' },
    { value: 'combo', label: 'Full Test' },
];

export const STATUS_FILTER_OPTIONS: Option<StatusFilter>[] = [
    { value: 'all', label: 'Mọi trạng thái' },
    { value: 'published', label: 'Đang khả dụng' },
    { value: 'review', label: 'Chờ thẩm định' },
    { value: 'draft', label: 'Bản nháp' },
];

export const SOURCE_FILTER_OPTIONS: Option<SourceFilter>[] = [
    { value: 'all', label: 'Mọi nguồn dữ liệu' },
    { value: 'study4', label: 'Study4 AI' },
    { value: 'ets', label: 'ETS chính thức' },
];

/** Phòng thi dùng để xem trước theo kỹ năng của đề. */
export const PREVIEW_HREF: Record<ExamSkill, string> = {
    speaking: '/speaking/test',
    writing: '/writing/test',
    combo: '/speaking/test',
};

export function formatCount(value: number): string {
    return value.toLocaleString('vi-VN');
}

export function formatTime(date: Date): string {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

export function getTabCounts(exams: ExamRecord[]): Record<LibraryTab, number> {
    return {
        all: exams.length,
        speaking: exams.filter((exam) => exam.skill === 'speaking').length,
        writing: exams.filter((exam) => exam.skill === 'writing').length,
        combo: exams.filter((exam) => exam.skill === 'combo').length,
    };
}

export interface ExamFilters {
    tab: LibraryTab;
    search: string;
    status: StatusFilter;
    source: SourceFilter;
}

export const DEFAULT_EXAM_FILTERS: ExamFilters = { tab: 'all', search: '', status: 'all', source: 'all' };

export function filterExams(exams: ExamRecord[], { tab, search, status, source }: ExamFilters): ExamRecord[] {
    const keyword = search.trim().toLowerCase();

    return exams.filter((exam) => {
        if (tab !== 'all' && exam.skill !== tab) return false;
        if (status !== 'all' && exam.status !== status) return false;
        if (source !== 'all' && exam.source !== source) return false;
        if (!keyword) return true;
        return [exam.id, exam.title, exam.sourceNote].some((field) => field.toLowerCase().includes(keyword));
    });
}

export function toPartContentMap(parts: StudioPart[]): PartContentMap {
    return Object.fromEntries(
        parts.map((part) => [part.id, { context: part.context ?? '', prompts: part.questions.map((q) => q.prompt) }]),
    );
}

export function isSameContent(a?: PartContent, b?: PartContent): boolean {
    if (!a || !b) return a === b;
    return (
        a.context === b.context &&
        a.prompts.length === b.prompts.length &&
        a.prompts.every((prompt, i) => prompt === b.prompts[i])
    );
}

/** Part hợp lệ khi có đủ ngữ cảnh (nếu Part yêu cầu), không bỏ trống đề bài và mọi audio đã khớp. */
export function isPartComplete(part: StudioPart, content?: PartContent): boolean {
    if (!content) return false;
    if (part.contextLabel && !content.context.trim()) return false;
    return part.questions.every((question, i) => question.audioReady && Boolean(content.prompts[i]?.trim()));
}

export function getCompletionPercent(parts: StudioPart[], contents: PartContentMap): number {
    if (parts.length === 0) return 0;
    const done = parts.filter((part) => isPartComplete(part, contents[part.id])).length;
    return Math.round((done / parts.length) * 100);
}
