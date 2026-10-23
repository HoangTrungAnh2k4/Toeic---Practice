import { cacheLife, cacheTag, revalidateTag } from 'next/cache';
import { listExamParts, listExams } from '@/lib/data/content';
import type { Skill } from '@/lib/domain/types';
import { summarizeExams } from './summarize';
import type { ExamSummary } from './types';

/** Tag để làm mới kho đề phía server sau khi admin tạo/phát hành đề. */
export const EXAMS_CACHE_TAG = 'exams';

/**
 * Gọi sau khi ghi đề trong Route Handler (không dùng được `updateTag`). `expire: 0`: không phục vụ bản cũ,
 * vì đề vừa gỡ phát hành mà còn hiện thì học viên bấm vào sẽ gặp 404.
 */
export const expireExamSummaries = () => revalidateTag(EXAMS_CACHE_TAG, { expire: 0 });

/** Đề đã phát hành (server không có phiên nên RLS chỉ trả `published`), cache dùng chung mọi người dùng. */
export async function getExamSummaries(): Promise<ExamSummary[]> {
    'use cache';
    cacheLife('minutes');
    cacheTag(EXAMS_CACHE_TAG);

    const [exams, parts] = await Promise.all([listExams(), listExamParts()]);
    return summarizeExams(exams, parts);
}

/** Đề đã phát hành của một kỹ năng cho thư viện đề học viên, mã đề mới nhất trước. */
export async function getLibraryExams(skill: Skill): Promise<ExamSummary[]> {
    const summaries = await getExamSummaries();
    return summaries
        .filter((exam) => exam.skill === skill && exam.status === 'published')
        .sort((a, b) => b.code.localeCompare(a.code));
}
