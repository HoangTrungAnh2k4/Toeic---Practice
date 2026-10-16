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
