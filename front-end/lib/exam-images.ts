import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import { logger } from '@/lib/logger';
import { deleteR2Object } from '@/lib/r2';

/** Ảnh đề trên R2 (chỉ dùng phía server): tải lên khi tạo/sửa đề, dọn khi xoá hoặc thay ảnh. */

const EXAM_IMAGE_DIR = 'exam-images';
const EXTENSION: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' };

/** URL công khai gốc của bucket, không có `/` cuối; `null` khi chưa cấu hình. */
export const r2PublicBase = () => process.env.R2_PUBLIC_URL?.replace(/\/$/, '') || null;

/** Key mới cho một ảnh đề kèm URL công khai lưu vào `questions.image_path`. */
export function newExamImage(base: string, file: File) {
    const key = `${EXAM_IMAGE_DIR}/${randomUUID()}.${EXTENSION[file.type]}`;
    return { key, path: `${base}/${key}` };
}

/**
 * Xoá trên R2 các ảnh đề không câu hỏi nào còn dùng. Chỉ ảnh dưới `exam-images/` (ảnh khác như `/img/...` của seed
 * không nằm trên R2). Gọi sau khi DB đã ghi xong nên lỗi chỉ ghi log: sót ảnh, không hỏng đề.
 */
export async function deleteUnusedExamImages(db: SupabaseClient<Database>, paths: (string | null)[], examId: string) {
    const base = r2PublicBase();
    if (!base) return;
    const candidates = [
        ...new Set(paths.filter((path): path is string => Boolean(path?.startsWith(`${base}/${EXAM_IMAGE_DIR}/`)))),
    ];
    if (candidates.length === 0) return;

    // Không xoá ảnh câu khác còn dùng (vd. đề nhập tay trỏ chung URL); không kiểm tra được thì không xoá
    const { data: shared, error } = await db.from('questions').select('image_path').in('image_path', candidates);
    if (error) {
        logger.error('exam images left behind on R2', { error, examId, paths: candidates });
        return;
    }
    const keys = candidates
        .filter((path) => !shared.some((row) => row.image_path === path))
        .map((path) => path.slice(base.length + 1));
    const results = await Promise.allSettled(keys.map((key) => deleteR2Object(key)));
    const failed = keys.filter((_, index) => results[index].status === 'rejected');
    if (failed.length > 0) logger.error('exam images left behind on R2', { examId, keys: failed });
}
