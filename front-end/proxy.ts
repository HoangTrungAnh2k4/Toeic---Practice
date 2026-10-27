import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { REMEMBER_COOKIE, sessionCookieOptions } from '@/lib/supabase-cookies';

/** Route cần đăng nhập. Quyền theo role (admin) kiểm tra tiếp ở layout của route. */
const PROTECTED = ['/exam-management'];
/** Route chỉ dành cho khách: đã đăng nhập thì chuyển thẳng vào /overview. */
const GUEST_ONLY = ['/login', '/register'];
/** Phòng thi → kỹ năng của đề (`?id=`). */
const EXAM_ROOMS: Record<string, 'speaking' | 'writing'> = { '/speaking/test': 'speaking', '/writing/test': 'writing' };

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
    // Admin không có Overview (sidebar admin chỉ có quản trị đề); mọi lối vào sau đăng nhập (form, OTP, Google) đều trỏ /overview nên đổi hướng ở đây
    if (data?.claims && pathname === '/overview') {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.claims.sub).maybeSingle();
        if (profile?.role === 'admin') {
            const toAdmin = NextResponse.redirect(new URL('/exam-management', request.url));
            response.cookies.getAll().forEach((cookie) => toAdmin.cookies.set(cookie));
            return toAdmin;
        }
    }

    // Phòng thi stream từ <Suspense> nên notFound() trong page chỉ ra status 200; kiểm đề ở đây để trả 404 thật.
    // RLS quyết định: khách/học viên chỉ đọc được đề published, admin đọc được cả nháp (xem trước).
    const skill = EXAM_ROOMS[pathname];
    const examId = request.nextUrl.searchParams.get('id');
    if (skill && examId) {
        const { data: exam, error } = await supabase
            .from('exams')
            .select('id')
            .eq('id', examId)
            .eq('skill', skill)
            .maybeSingle();
        // Có lỗi (id sai định dạng, mất kết nối) thì để page tự xử lý như trước
        if (!error && !exam) {
            // Đường dẫn không có route → Next render app/not-found.tsx với status 404, URL trên trình duyệt giữ nguyên
            const notFound = NextResponse.rewrite(new URL('/_exam-not-found', request.url), { request });
            response.cookies.getAll().forEach((cookie) => notFound.cookies.set(cookie));
            return notFound;
        }
    }

    return response;
}

export const config = {
    // Bỏ qua file tĩnh và ảnh để không gọi Supabase vô ích
    matcher: ['/((?!_next/static|_next/image|favicon.ico|img/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|wav)$).*)'],
};
