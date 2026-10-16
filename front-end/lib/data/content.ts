import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';
import type { Exam, ExamPart, ExamStats, Question } from '@/lib/domain/types';
import { supabase } from '@/lib/supabase';

/**
 * Ngân hàng đề trong Supabase. Chạy được cả server lẫn client: trên server không có phiên nên chỉ thấy đề
 * `published` (RLS), trên client admin đã đăng nhập thấy mọi trạng thái. Server cần phiên (phòng thi) thì truyền
 * `db` = `createServerSupabase()`.
 */

export async function listExams(): Promise<Exam[]> {
    const { data, error } = await supabase.from('exams').select('*');
    if (error) throw error;
    return data;
}

export async function getExam(id: string, db: SupabaseClient<Database> = supabase): Promise<Exam | null> {
    const { data, error } = await db.from('exams').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
}

/** Bỏ trống `examId` để lấy Part của mọi đề. */
export async function listExamParts(examId?: string, db: SupabaseClient<Database> = supabase): Promise<ExamPart[]> {
    const query = db.from('exam_parts').select('*');
    const { data, error } = await (examId ? query.eq('exam_id', examId) : query);
    if (error) throw error;
    return data;
}

/** Câu hỏi của một đề, theo thứ tự số câu. */
export async function listQuestions(examId: string, db: SupabaseClient<Database> = supabase): Promise<Question[]> {
    const { data, error } = await db
        .from('questions')
        // inner join chỉ để lọc theo đề, không lấy cột nào của exam_parts
        .select(
            'id, exam_part_id, number, prompt, stimulus, image_path, image_alt, audio_path, keywords, sample_answer, hint, exam_parts!inner()',
        )
        .eq('exam_parts.exam_id', examId)
        .order('number');
    if (error) throw error;
    // keywords là jsonb, nội dung do admin nhập theo dạng RequiredKeyword[]
    return data as Question[];
}

// shortcut: chưa có view `exam_stats` nên chưa có thống kê lượt làm; đọc view khi backend thêm.
export async function listExamStats(): Promise<ExamStats[]> {
    return [];
}
