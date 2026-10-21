import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { REMEMBER_COOKIE, sessionCookieOptions } from '@/lib/supabase-cookies';

/** Route cần đăng nhập. Quyền theo role (admin) kiểm tra tiếp ở layout của route. */
const PROTECTED = ['/setting/exam-management'];
/** Route chỉ dành cho khách: đã đăng nhập thì chuyển thẳng vào /overview. */
const GUEST_ONLY = ['/login', '/register'];

/** Làm mới phiên Supabase trong cookie ở mỗi request và chặn sớm khách vào route cần đăng nhập. */
export async function proxy(request: NextRequest) {
    let response = NextResponse.next({ request });
    const remember = request.cookies.get(REMEMBER_COOKIE)?.value !== '0';

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll: () => request.cookies.getAll(),
                setAll: (list) => {
                    list.forEach(({ name, value }) => request.cookies.set(name, value));
                    response = NextResponse.next({ request });
                    list.forEach(({ name, value, options }) =>
                        response.cookies.set(name, value, sessionCookieOptions(remember, value, options)),
                    );
                },
            },
        },
    );

    // getClaims xác thực JWT và làm mới token hết hạn; không được chen code giữa createServerClient và lời gọi này
    const { data } = await supabase.auth.getClaims();

    const { pathname } = request.nextUrl;
    if (!data?.claims && PROTECTED.some((path) => pathname.startsWith(path))) {
        return NextResponse.redirect(new URL('/login', request.url));
    }
    if (data?.claims && GUEST_ONLY.includes(pathname)) {
        return NextResponse.redirect(new URL('/overview', request.url));
    }

    return response;
}

export const config = {
    // Bỏ qua file tĩnh và ảnh để không gọi Supabase vô ích
    matcher: ['/((?!_next/static|_next/image|favicon.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav)$).*)'],
};
