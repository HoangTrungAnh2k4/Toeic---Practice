import { listExamParts, listExams, listExamStats } from '@/lib/data/content';
import { summarizeExams } from '@/lib/exam-library/summarize';
import { ExamLibraryItem } from '../types';

/** Chạy phía client để dùng phiên admin: RLS mới trả cả đề `draft`/`review`. */
export async function getExamLibrary(): Promise<ExamLibraryItem[]> {
    const [exams, parts, stats] = await Promise.all([listExams(), listExamParts(), listExamStats()]);
    return summarizeExams(exams, parts).map((exam) => ({
        ...exam,
        stats: stats.find((row) => row.exam_id === exam.id) ?? null,
    }));
}

/** Mã lỗi từ `DELETE /api/exams/[id]` → thông báo cho admin. */
const DELETE_ERROR: Record<string, string> = {
    has_attempts: 'Đề đã có lượt thi nên không thể xóa. Hãy chuyển về nháp để ẩn đề.',
    not_found: 'Không xóa được đề: đề không còn tồn tại hoặc bạn không có quyền.',
    unauthorized: 'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.',
};

/** Trả về thông báo lỗi, hoặc `null` khi đã xoá. Server xoá đề rồi xoá ảnh của đề trên R2. */
export async function deleteExam(id: string): Promise<string | null> {
    const response = await fetch(`/api/exams/${id}`, { method: 'DELETE' });
    if (response.ok) return null;
    const body = await response.json().catch(() => null);
    return DELETE_ERROR[body?.error] ?? 'Không xóa được đề. Vui lòng thử lại.';
}
