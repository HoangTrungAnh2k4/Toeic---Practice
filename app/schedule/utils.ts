import { AiInsight, DayTask, ExamGoal, MonthlyProgress, SkillProgress, StudyWeek, WeeklyTask } from './types';

export const EXAM_GOAL: ExamGoal = {
    daysLeft: 24,
    examDate: '18/06/2025',
    minutesPerDay: 45,
    daysPerWeek: 5,
    streakDays: 12,
};

export const SKILL_PROGRESS: SkillProgress[] = [
    {
        skill: 'speaking',
        label: 'Speaking',
        current: 135,
        target: 160,
        targetLevel: 'Level 7',
        focus: 'Phát âm từ nối & phản xạ Q5-7',
    },
    {
        skill: 'writing',
        label: 'Writing',
        current: 145,
        target: 170,
        targetLevel: 'Level 8',
        focus: 'Email Q6-7 & luận điểm Essay Q8',
    },
];

export const MONTHLY_PROGRESS: MonthlyProgress = {
    completed: 17,
    total: 25,
    note: 'Vượt tiến độ 2 ngày so với dự kiến',
};

export const CURRENT_WEEK: StudyWeek = {
    index: 3,
    theme: 'Phản xạ tình huống & Email chuyên sâu',
    range: '19/05 – 25/05',
    isCurrent: true,
    completedSessions: 4,
    totalSessions: 6,
    days: [
        {
            id: 'mon',
            weekday: 'Thứ 2',
            date: '19/05',
            status: 'done',
            tasks: [
                {
                    id: 'mon-1',
                    skill: 'speaking',
                    label: 'Speaking Part 3',
                    title: 'Q5-7: Thói quen mua sắm trực tuyến',
                    duration: 20,
                },
            ],
            meta: { label: 'Kết quả', value: '135/200' },
        },
        {
            id: 'tue',
            weekday: 'Thứ 3',
            date: '20/05',
            status: 'done',
            tasks: [
                {
                    id: 'tue-1',
                    skill: 'writing',
                    label: 'Writing Part 2',
                    title: 'Q6-7: Email xử lý đơn hàng trễ',
                    duration: 25,
                },
            ],
            meta: { label: 'Ghi chú', value: 'Đã sửa logic' },
        },
        {
            id: 'wed',
            weekday: 'Thứ 4',
            date: '21/05',
            status: 'done',
            tasks: [
                {
                    id: 'wed-1',
                    skill: 'review',
                    label: 'Ôn tập Sổ lỗi',
                    title: '3 lỗi giới từ không gian Q3-4 Speaking',
                    duration: 15,
                },
            ],
            meta: { label: 'Thẻ nhớ', value: '100%' },
        },
        {
            id: 'thu',
            weekday: 'Thứ 5',
            date: '22/05',
            status: 'today',
            tasks: [
                {
                    id: 'thu-1',
                    skill: 'speaking',
                    label: 'Speaking Q11',
                    title: 'Remote Work vs In-Office Setup',
                    description: 'Rèn cấu trúc 2 luận điểm chuẩn 60 giây không vấp.',
                    duration: 25,
                },
                {
                    id: 'thu-2',
                    skill: 'writing',
                    label: 'Writing Q1-5',
                    title: 'Luyện tốc độ viết câu theo tranh – Set D',
                    description: '100% đúng ngữ pháp, dùng đủ 2 từ khóa bắt buộc.',
                    duration: 10,
                },
            ],
        },
        {
            id: 'fri',
            weekday: 'Thứ 6',
            date: '23/05',
            status: 'upcoming',
            tasks: [
                {
                    id: 'fri-1',
                    skill: 'writing',
                    label: 'Writing Part 3',
                    title: 'Q8: Essay 300 từ – Trách nhiệm XH doanh nghiệp',
                    duration: 35,
                },
            ],
            meta: { label: 'Mục tiêu', value: '> 280 từ' },
        },
        {
            id: 'sat',
            weekday: 'Thứ 7',
            date: '24/05',
            status: 'upcoming',
            tasks: [
                {
                    id: 'sat-1',
                    skill: 'mock',
                    label: 'Full Mock Test',
                    title: 'Full Speaking CBT (11 câu chuẩn phòng thi)',
                    duration: 25,
                },
            ],
            meta: { label: 'Hình thức', value: 'Chấm AI' },
        },
        {
            id: 'sun',
            weekday: 'Chủ nhật',
            date: '25/05',
            status: 'upcoming',
            tasks: [
                {
                    id: 'sun-1',
                    skill: 'summary',
                    label: 'Tổng kết tuần',
                    title: 'Đánh giá tuần & cập nhật Sổ lỗi cá nhân',
                    duration: 20,
                },
            ],
            meta: { label: 'Lộ trình', value: 'Tự động chốt' },
        },
    ],
};

export const AI_CONFIDENCE = 94.8;

export const AI_INSIGHTS: AiInsight[] = [
    {
        id: 'writing-email',
        skill: 'writing',
        title: 'Writing Part 2 – Email Q6-7',
        metric: 'Tỷ lệ đạt 66% / mục tiêu 90%',
        tone: 'critical',
        summary:
            'Bạn thường chỉ đáp ứng 1 trong 2 yêu cầu bắt buộc (thiếu đề xuất ngày hẹn hoặc phương án hoàn tiền). Tuần này tăng cường ',
        highlight: '2 bài luyện phân tích đề',
        conclusion: ' để hình thành thói quen rà checklist trước khi nộp.',
        tag: 'Bài thi độc lập, không trợ giúp',
        linkLabel: 'Xem báo cáo chi tiết',
        href: '/history',
    },
    {
        id: 'speaking-latency',
        skill: 'speaking',
        title: 'Speaking Part 3 – Độ trễ Q5',
        metric: 'Độ trễ TB 1.8s / tối ưu 0.5s',
        tone: 'warning',
        summary: 'Thời gian bắt đầu nói sau tiếng beep còn ngập ngừng. Lộ trình đã tự chèn ',
        highlight: 'Micro-drill mở đầu câu',
        conclusion: ' vào Thứ 2 và Thứ 5 để giảm áp lực phản xạ tức thời.',
        tag: 'Có kịch bản hướng dẫn mở câu',
        linkLabel: 'Xem biểu đồ phản xạ',
        href: '/history',
    },
];

export const WEEKLY_TASKS: WeeklyTask[] = [
    {
        id: 'w1',
        skill: 'speaking',
        partLabel: 'Speaking P3',
        topic: 'Q5-7: Thói quen mua sắm trực tuyến',
        rubric: 'Cố định cụm nối thời gian, "ah, um" không quá 2 lần',
        duration: 20,
        status: 'done',
        actionLabel: 'Xem lại bản ghi',
        href: '/history',
    },
    {
        id: 'w2',
        skill: 'writing',
        partLabel: 'Writing P2',
        topic: 'Q6-7: Email xử lý đơn hàng trễ',
        rubric: 'Đủ 2 nhiệm vụ: lời xin lỗi + phương án bồi hoàn',
        duration: 25,
        status: 'done',
        actionLabel: 'Xem bài sửa',
        href: '/history',
    },
    {
        id: 'w3',
        skill: 'speaking',
        partLabel: 'Speaking P5',
        topic: 'Q11: Express an Opinion – Remote Work vs In-Office',
        rubric: 'Cấu trúc PREP (Point – Reason – Example – Point) trong 60 giây',
        duration: 25,
        status: 'today',
        actionLabel: 'Vào học',
        href: '/speaking',
    },
    {
        id: 'w4',
        skill: 'writing',
        partLabel: 'Writing P1',
        topic: 'Q1-5: Tốc độ viết câu theo tranh (Set D)',
        rubric: '100% đúng ngữ pháp, kiểm soát 2 từ khóa bắt buộc',
        duration: 10,
        status: 'todo',
        actionLabel: 'Bắt đầu',
        href: '/writing',
    },
    {
        id: 'w5',
        skill: 'writing',
        partLabel: 'Writing P3',
        topic: 'Q8: Essay 300 từ – Trách nhiệm xã hội',
        rubric: 'Đủ 4 đoạn: Intro, 2 Body có ví dụ thực tế, Conclusion',
        duration: 35,
        status: 'scheduled',
        statusLabel: 'Dự kiến Thứ 6',
        actionLabel: 'Xem trước đề',
        href: '/writing',
    },
];

export const SESSION_DURATION_OPTIONS = [30, 45, 60] as const;

export function getProgressPercent(current: number, target: number): number {
    if (target <= 0) return 0;
    return Math.min(100, Math.round((current / target) * 100));
}

export function getTotalDuration(tasks: DayTask[]): number {
    return tasks.reduce((sum, task) => sum + task.duration, 0);
}

export function formatMinutes(minutes: number): string {
    return `${minutes} phút`;
}
