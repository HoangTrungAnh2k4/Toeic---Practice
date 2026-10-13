import { CURRENT_USER } from '@/app/setting/profile/utils';
import type { CurrentUser } from '@/app/setting/profile/types';

/**
 * CHƯA nối backend xác thực: đổi cờ này để xem giao diện khi đã / chưa đăng nhập.
 * Khi tích hợp, thay thân hook bằng phiên thật và giữ nguyên chữ ký (`null` = khách).
 */
const MOCK_SIGNED_IN = false;

export function useCurrentUser(): CurrentUser | null {
    return MOCK_SIGNED_IN ? CURRENT_USER : null;
}
