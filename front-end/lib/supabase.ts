import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const REMEMBER_KEY = 'toeco-remember';

/** Gọi trước khi đăng nhập: không ghi nhớ thì phiên nằm ở sessionStorage, đóng trình duyệt là mất. */
export function setRememberSession(remember: boolean) {
    if (remember) localStorage.removeItem(REMEMBER_KEY);
    else localStorage.setItem(REMEMBER_KEY, '0');
}

const pickStore = () => (localStorage.getItem(REMEMBER_KEY) === '0' ? sessionStorage : localStorage);

const sessionStore = {
    getItem: (key: string) => localStorage.getItem(key) ?? sessionStorage.getItem(key),
    setItem: (key: string, value: string) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
        pickStore().setItem(key, value);
    },
    removeItem: (key: string) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
    },
};

export const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { storage: typeof window === 'undefined' ? undefined : sessionStore } },
);
