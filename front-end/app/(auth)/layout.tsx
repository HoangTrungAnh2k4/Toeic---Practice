import AuthShowcase from './_components/AuthShowcase';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // Margin âm triệt padding của khung root (app/layout.tsx); không dùng :has() vì cacheComponents giữ route ẩn trong DOM
        <div data-slot="auth-shell" className="flex flex-col bg-canvas bg-dots -mx-4 sm:-mx-8 -mt-4 -mb-10 px-4 sm:px-8 pt-8 pb-12 min-h-dvh">
            <div className="flex lg:flex-row flex-col flex-1 lg:items-start gap-10 lg:gap-14 mx-auto w-full max-w-6xl">
                <AuthShowcase />
                <main className="flex justify-center lg:w-115 lg:shrink-0">{children}</main>
            </div>
        </div>
    );
}
