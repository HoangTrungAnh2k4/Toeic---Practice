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
            className="bg-card shadow-[8px_8px_0_0_#000] p-6 px-8 border-2 border-black rounded-2xl w-full max-w-105 motion-safe:animate-rise"
        >
            <header className="flex flex-col gap-2 mb-5">
                <h1 id="auth-title" className="font-bold text-main text-2xl sm:text-3xl tracking-tight">
                    {title}
                </h1>
                <p className="font-medium text-subText text-sm sm:text-base leading-relaxed">{description}</p>
            </header>

            {children}

            <p className="mt-5 pt-5 border-border border-t text-subText text-sm sm:text-base text-center">
                {alternate.prompt}{' '}
                <Link
                    href={alternate.href}
                    className="rounded-sm focus-visible:outline-2 focus-visible:outline-main focus-visible:outline-offset-2 font-bold text-main hover:underline underline-offset-4"
                >
                    {alternate.label}
                </Link>
            </p>
        </section>
    );
}
