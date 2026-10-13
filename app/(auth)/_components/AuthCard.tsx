import Link from 'next/link';

interface AuthCardProps {
    title: string;
    description: string;
    /** Liên kết chuyển qua lại giữa đăng nhập và đăng ký. */
    alternate: { prompt: string; label: string; href: string };
    children: React.ReactNode;
}

export default function AuthCard({ title, description, alternate, children }: AuthCardProps) {
    return (
        <section
            aria-labelledby="auth-title"
            className="bg-card shadow-sm p-6 sm:p-8 border border-sub2/30 rounded-xl w-full max-w-md motion-safe:animate-rise"
        >
            <header className="flex flex-col gap-1.5 mb-6">
                <h1 id="auth-title" className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                    {title}
                </h1>
                <p className="font-medium text-subText text-sm leading-relaxed">{description}</p>
            </header>

            {children}

            <p className="mt-6 pt-5 border-sub2/20 border-t font-medium text-subText text-sm text-center">
                {alternate.prompt}{' '}
                <Link
                    href={alternate.href}
                    className="rounded-sm font-bold text-main hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-main focus-visible:outline-offset-2"
                >
                    {alternate.label}
                </Link>
            </p>
        </section>
    );
}
