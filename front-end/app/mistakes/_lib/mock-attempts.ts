import type { Skill } from '@/lib/domain/types';
import type { ResponseAnnotation } from '../types';

/**
 * Lịch sử bài làm giả lập cho sổ lỗi, tạm dùng tới Bước 4.5 (sổ lỗi đọc annotations thật).
 * Các lượt này không có trong localStorage nên link "xem bài" từ sổ lỗi sẽ ra trang không tìm thấy.
 */

export interface AttemptScore {
    score?: number;
    maxScore: number;
    level?: string;
    feedbackSummary?: string;
    scoringProgress?: number;
    isScoring?: boolean;
    estimatedTimeRemaining?: string;
    isInterrupted?: boolean;
    interruptedReason?: string;
    retakeComparison?: string;
}

export interface HistoryAttempt {
    id: string;
    code: string;
    title: string;
    part: string;
    topic: string;
    skill: Skill;
    mode: string;
    modeType: 'cbt' | 'timed' | 'guided';
    categoryBadge: string;
    assistBadge: string;
    hasSampleViewed?: boolean;
    scoreInfo: AttemptScore;
    submittedAt: string;
    duration: string;
    actionText: string;
    isWarningRow?: boolean;
    isPendingRow?: boolean;
}

export interface ReviewQuestion {
    number: number;
    task: string;
    /** Yêu cầu / Directions của đề. */
    prompt: string;
    /** Ngữ liệu đi kèm: mô tả tranh, email đề bài, đoạn văn cần đọc... */
    stimulus?: string;
    /** Từ khoá bắt buộc (Writing Q1-5). */
    keywords?: string[];
    score?: { value: number; max: number };
    /** Writing: bài viết; Speaking: transcript do AI nhận dạng. */
    response: string;
    /** Thời lượng trả lời tối đa (giây) — chỉ Speaking. */
    responseTime?: number;
    annotations: ResponseAnnotation[];
    strengths: string[];
}

export const MOCK_ATTEMPTS: HistoryAttempt[] = [
    {
        id: '1',
        code: '#ATT-9041',
        title: 'Test 04 — Describe a Picture (Q3-Q4)',
        part: 'Part 2',
        topic: 'Chủ đề: Outdoor Coffee Shop & Busy Commuters',
        skill: 'speaking',
        mode: 'Thi thử chuẩn (CBT)',
        modeType: 'cbt',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 140,
            maxScore: 200,
            level: 'Level 6',
            feedbackSummary: 'Phát âm: Cao | Ngữ pháp: Khá',
        },
        submittedAt: 'Hôm nay, 10:45',
        duration: '18m 42s',
        actionText: 'Xem lại chi tiết',
    },
    {
        id: '2',
        code: '#ATT-8992',
        title: 'Test 02 — Write an Opinion Essay (Task 8)',
        part: 'Part 3',
        topic: 'Chủ đề: Remote Work vs. In-office Productivity (342 từ)',
        skill: 'writing',
        mode: 'Thi thử chuẩn (CBT)',
        modeType: 'cbt',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            maxScore: 200,
            isScoring: true,
            scoringProgress: 85,
            estimatedTimeRemaining: '~1 phút nữa',
        },
        submittedAt: 'Hôm qua, 21:15',
        duration: '29m 10s',
        actionText: 'Kiểm tra tiến độ',
        isPendingRow: true,
    },
    {
        id: '3',
        code: '#ATT-8760',
        title: 'Test 01 — Express an Opinion (Question 11)',
        part: 'Part 5',
        topic: 'Chủ đề: Company Training Programs: Online vs In-person',
        skill: 'speaking',
        mode: 'Học có hướng dẫn',
        modeType: 'guided',
        categoryBadge: 'Làm lại #2',
        assistBadge: 'Có xem bài mẫu',
        hasSampleViewed: true,
        scoreInfo: {
            score: 130,
            maxScore: 200,
            level: 'Level 5+',
            retakeComparison: '+15 điểm so với lượt #1',
        },
        submittedAt: '2 ngày trước, 15:30',
        duration: '12m 05s',
        actionText: 'Xem & So sánh #1',
    },
    {
        id: '4',
        code: '#ATT-8604',
        title: 'Test 03 — Speaking Full Test',
        part: 'Cả đề',
        topic: 'Bị gián đoạn tại Speaking Q06 (Mất tín hiệu mic)',
        skill: 'speaking',
        mode: 'Thi thử chuẩn (CBT)',
        modeType: 'cbt',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            maxScore: 200,
            isInterrupted: true,
            interruptedReason: 'Đã lưu 5/11 câu',
        },
        submittedAt: '3 ngày trước, 09:15',
        duration: '14m 20s',
        actionText: 'Tiếp tục làm tiếp',
        isWarningRow: true,
    },
    {
        id: '5',
        code: '#ATT-8419',
        title: 'Test 02 — Respond to Written Request (Task 6-7)',
        part: 'Part 2',
        topic: 'Chủ đề: Customer Inquiry regarding Delivery Delay & Refund',
        skill: 'writing',
        mode: 'Luyện có thời gian',
        modeType: 'timed',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 160,
            maxScore: 200,
            level: 'Level 7',
            feedbackSummary: 'Ngữ điệu tự nhiên | Đủ 3 yêu cầu',
        },
        submittedAt: '5 ngày trước, 20:00',
        duration: '19m 50s',
        actionText: 'Xem lại chi tiết',
    },
    {
        id: '6',
        code: '#ATT-8301',
        title: 'Test 05 — Describe a Picture (Q3-Q4)',
        part: 'Part 2',
        topic: 'Chủ đề: Outdoor Market & Airport Lounge',
        skill: 'speaking',
        mode: 'Luyện có thời gian',
        modeType: 'timed',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 130,
            maxScore: 200,
            level: 'Level 5+',
            feedbackSummary: 'Phát âm: Khá | Từ vựng: Trung bình',
        },
        submittedAt: '5 ngày trước, 08:15',
        duration: '6m 10s',
        actionText: 'Xem lại chi tiết',
    },
    {
        id: '7',
        code: '#ATT-8188',
        title: 'Test 01 — Respond to Written Request (Task 6-7)',
        part: 'Part 2',
        topic: 'Chủ đề: Office Printer & Workshop Registration',
        skill: 'writing',
        mode: 'Thi thử chuẩn (CBT)',
        modeType: 'cbt',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 150,
            maxScore: 200,
            level: 'Level 6',
            feedbackSummary: 'Ngữ pháp: Khá | Thiếu 1 yêu cầu',
        },
        submittedAt: '6 ngày trước, 21:00',
        duration: '20m 00s',
        actionText: 'Xem lại chi tiết',
    },
    {
        id: '8',
        code: '#ATT-8102',
        title: 'Test 05 — Write a Sentence (Q1-Q5)',
        part: 'Part 1',
        topic: 'Chủ đề: Daily Activities & Workplace Scenes',
        skill: 'writing',
        mode: 'Luyện có thời gian',
        modeType: 'timed',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 170,
            maxScore: 200,
            level: 'Level 8',
            feedbackSummary: 'Đủ từ khoá | Ngữ pháp: Khá',
        },
        submittedAt: '6 ngày trước, 08:40',
        duration: '7m 45s',
        actionText: 'Xem lại chi tiết',
    },
    {
        id: '9',
        code: '#ATT-8040',
        title: 'Test 03 — Respond to Questions (Q5-Q7)',
        part: 'Part 3',
        topic: 'Chủ đề: Telephone Survey about Coffee Shops',
        skill: 'speaking',
        mode: 'Luyện có thời gian',
        modeType: 'timed',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 140,
            maxScore: 200,
            level: 'Level 6',
            feedbackSummary: 'Trôi chảy: Tốt | Bám câu hỏi: Khá',
        },
        submittedAt: '7 ngày trước, 19:30',
        duration: '4m 20s',
        actionText: 'Xem lại chi tiết',
    },
    {
        id: '10',
        code: '#ATT-7985',
        title: 'Test 02 — Read a Text Aloud (Q1-Q2)',
        part: 'Part 1',
        topic: 'Chủ đề: Store Announcement & Summer Sale',
        skill: 'speaking',
        mode: 'Luyện có thời gian',
        modeType: 'timed',
        categoryBadge: 'Đề chưa gặp',
        assistBadge: 'Không trợ giúp',
        scoreInfo: {
            score: 120,
            maxScore: 200,
            level: 'Level 5',
            feedbackSummary: 'Phát âm: Trung bình | Ngữ điệu: Đều',
        },
        submittedAt: '7 ngày trước, 07:30',
        duration: '3m 50s',
        actionText: 'Xem lại chi tiết',
    },
];
