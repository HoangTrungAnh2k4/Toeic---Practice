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
import type { PartStrategy } from '@/lib/exam-library/types';
import type { RubricPart } from './types';

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
