import { listExamParts, listExams, listExamStats } from '@/lib/data/content';
import { summarizeExams } from '@/lib/exam-library/summarize';
import { supabase } from '@/lib/supabase';
import { ExamLibraryItem } from '../types';

/** Chạy phía client để dùng phiên admin: RLS mới trả cả đề `draft`/`review`. */
export async function getExamLibrary(): Promise<ExamLibraryItem[]> {
    const [exams, parts, stats] = await Promise.all([listExams(), listExamParts(), listExamStats()]);
    return summarizeExams(exams, parts).map((exam) => ({
        ...exam,
        stats: stats.find((row) => row.exam_id === exam.id) ?? null,
    }));
}

/** Trả về thông báo lỗi, hoặc `null` khi đã xoá. Part/câu hỏi/bookmark xoá theo cascade. */
export async function deleteExam(id: string): Promise<string | null> {
    const { data, error } = await supabase.from('exams').delete().eq('id', id).select('id');
    // 23503: `attempts.exam_id` là `on delete restrict` để giữ lịch sử làm bài
    if (error?.code === '23503') return 'Đề đã có lượt thi nên không thể xóa. Hãy chuyển về nháp để ẩn đề.';
    if (error) return 'Không xóa được đề. Vui lòng thử lại.';
    // RLS chặn thì Supabase không báo lỗi, chỉ xoá 0 dòng
    if (data.length === 0) return 'Không xóa được đề: đề không còn tồn tại hoặc bạn không có quyền.';
    return null;
}
