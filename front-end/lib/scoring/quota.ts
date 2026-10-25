import { createHash } from 'node:crypto';
import { logger } from '@/lib/logger';
import { createAdminSupabase } from '@/lib/supabase-admin';

/** Số câu được chấm mỗi ngày, dùng chung Speaking và Writing: khách 3 bài, người đăng nhập 5 bài Speaking (11 câu/bài). */
const DAILY_LIMIT = { guest: 33, user: 55 };

/**
 * Hạn mức chấm theo ngày (giờ VN) của người gọi: người đăng nhập theo `user_id`, khách theo IP băm.
 * shortcut: IP băm sha256 không muối, đủ để không lưu IP thô; thêm secret salt nếu cần chống dò ngược
 */
export function scoringQuota(request: Request, userId: string | null) {
    const admin = createAdminSupabase();
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const subject = userId ? `user:${userId}` : `ip:${createHash('sha256').update(ip).digest('hex')}`;
    return {
        /** Trừ một lượt; `false` khi đã hết lượt hôm nay. Lỗi DB thì ném. */
        async consume() {
            const { data, error } = await admin.rpc('consume_scoring_quota', {
                p_subject: subject,
                p_limit: userId ? DAILY_LIMIT.user : DAILY_LIMIT.guest,
            });
            if (error) throw error;
            return Boolean(data);
        },
        /** Chấm/lưu lỗi thì trả lại lượt, để thử lại không bị trừ thêm. */
        async refund() {
            const { error } = await admin.rpc('refund_scoring_quota', { p_subject: subject });
            if (error) logger.error('scoring quota refund failed', { error });
        },
    };
}
