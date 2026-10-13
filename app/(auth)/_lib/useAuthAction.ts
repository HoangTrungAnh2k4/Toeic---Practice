'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { AFTER_AUTH_HREF, type AuthResult } from './auth';

export type AuthMethod = 'email' | 'google';

const NETWORK_ERROR = 'Không thể kết nối tới máy chủ. Vui lòng thử lại.';

/** Chạy một thao tác xác thực: theo dõi trạng thái chờ, lỗi và chuyển trang khi thành công. */
export function useAuthAction() {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [method, setMethod] = useState<AuthMethod | null>(null);
    const [error, setError] = useState<string | null>(null);

    function run(nextMethod: AuthMethod, action: () => Promise<AuthResult>) {
        setMethod(nextMethod);
        setError(null);

        startTransition(async () => {
            let result: AuthResult;
            try {
                result = await action();
            } catch {
                result = { ok: false, message: NETWORK_ERROR };
            }

            if (!result.ok) {
                setError(result.message);
                return;
            }

            // Giữ trạng thái chờ tới khi chuyển trang xong
            startTransition(() => router.push(AFTER_AUTH_HREF));
        });
    }

    return { run, error, isPending, pendingMethod: isPending ? method : null };
}
