import { cacheLife } from 'next/cache';
import type { MistakePattern } from '@/lib/domain/types';
import { supabase } from '@/lib/supabase';

/**
 * Mẫu lỗi lặp lại (bảng `mistake_patterns`) — nội dung dùng chung, không phụ thuộc người dùng.
 * Trạng thái, tần suất và bằng chứng KHÔNG lưu ở đây mà tính từ các bài đã chấm của từng người.
 * Chỉ gọi từ server (`'use cache'`): danh mục seed bằng migration, hiếm khi đổi.
 */
export async function listMistakePatterns(): Promise<MistakePattern[]> {
    'use cache';
    cacheLife('hours');

    const { data, error } = await supabase
        .from('mistake_patterns')
        .select('id, skill, part_template_id, title, summary, why, criteria, severity, impact, remedy')
        .order('id');
    if (error) throw error;
    // remedy là jsonb, nội dung seed theo dạng MistakeRemedy
    return data as unknown as MistakePattern[];
}
