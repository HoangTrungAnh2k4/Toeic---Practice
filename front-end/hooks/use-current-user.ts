import type { CurrentUser } from '@/app/setting/profile/types';

// shortcut: chưa có auth nên luôn là khách, nối lại khi có backend
export function useCurrentUser(): CurrentUser | null {
    return null;
}
