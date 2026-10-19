import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { copyrightYear } from '@/components/layout/footer/footer-data';

/** Khối kêu gọi cuối trang + dòng bản quyền (landing không dùng SiteFooter của khung ứng dụng). */
export default function LandingCta() {
    return (
        <>
            <section
                aria-labelledby="cta-title"
                className="flex flex-col items-center gap-5 bg-main px-6 py-12 rounded-2xl text-center"
            >
                <h2 id="cta-title" className="font-bold text-white text-3xl tracking-tight">
                    Sẵn sàng cho bài luyện đầu tiên?
                </h2>
                <p className="max-w-md font-medium text-sub1 text-sm">
                    Làm thử một đề Speaking hoặc Writing ngay, không cần đăng ký.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/speaking" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
                        Luyện Speaking
                    </Link>
                    <Link href="/writing" className={buttonVariants({ variant: 'secondary', size: 'lg' })}>
                        Luyện Writing
                    </Link>
                </div>
            </section>

            <p className="font-medium text-subText text-sm text-center">© {copyrightYear} Toeco</p>
        </>
    );
}
