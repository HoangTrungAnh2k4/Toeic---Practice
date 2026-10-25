import { listExamParts, listExams, listExamStats } from '@/lib/data/content';
import type { ExamStatus } from '@/lib/domain/types';
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
    has_attempts: 'Đề đã có lượt thi nên không thể xóa. Hãy lưu trữ để gỡ đề khỏi Thư viện.',
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

/** Mã lỗi từ `POST /api/exams/[id]/status` → thông báo cho admin. */
const STATUS_ERROR: Record<string, string> = {
    invalid_transition: 'Trạng thái hoặc lượt thi của đề đã thay đổi. Vui lòng tải lại trang.',
    note_required: 'Vui lòng ghi lý do trả về nháp.',
    incomplete: 'Đề còn thiếu dữ liệu nên chưa phát hành được:',
    not_found: 'Không tìm thấy đề hoặc bạn không có quyền.',
    unauthorized: 'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.',
};

/** Mã lỗi từ `POST /api/exams/[id]/duplicate` → thông báo cho admin. */
const DUPLICATE_ERROR: Record<string, string> = {
    not_found: 'Không nhân bản được: đề không còn tồn tại hoặc bạn không có quyền.',
    forbidden: 'Tài khoản của bạn không có quyền nhân bản đề.',
    unauthorized: 'Phiên đăng nhập đã hết. Vui lòng đăng nhập lại.',
};

/** Nhân bản đề thành bản nháp mới; trả về id bản nháp, hoặc thông báo lỗi. */
export async function duplicateExam(id: string): Promise<{ id: string } | { error: string }> {
    const response = await fetch(`/api/exams/${id}/duplicate`, { method: 'POST' }).catch(() => null);
    const body = await response?.json().catch(() => null);
    if (response?.ok && typeof body?.id === 'string') return { id: body.id };
    return { error: DUPLICATE_ERROR[body?.error] ?? 'Không nhân bản được đề. Vui lòng thử lại.' };
}

export type StatusChangeResult ={ ok: true } | { ok: false; message: string; issues: string[] };

/** Chuyển trạng thái đề; phát hành bị chặn thì `issues` liệt kê câu còn thiếu. */
export async function changeExamStatus(id: string, status: ExamStatus, note?: string): Promise<StatusChangeResult> {
    const response = await fetch(`/api/exams/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note }),
    }).catch(() => null);
    if (response?.ok) return { ok: true };
    const body = await response?.json().catch(() => null);
    return {
        ok: false,
        message: STATUS_ERROR[body?.error] ?? 'Không đổi được trạng thái. Vui lòng thử lại.',
        issues: Array.isArray(body?.issues) ? body.issues : [],
    };
}
