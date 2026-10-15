import { listExamStats } from '@/lib/data/content';
import { getExamSummaries } from '@/lib/exam-library/summaries';
import { ExamLibraryItem } from '../types';

export async function getExamLibrary(): Promise<ExamLibraryItem[]> {
    const [exams, stats] = await Promise.all([getExamSummaries(), listExamStats()]);
    return exams.map((exam) => ({ ...exam, stats: stats.find((row) => row.exam_id === exam.id) ?? null }));
}
