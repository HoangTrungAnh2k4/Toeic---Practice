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
import type { PartStrategy } from '@/lib/exam-library/types';
import type { RubricPart } from './types';

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
