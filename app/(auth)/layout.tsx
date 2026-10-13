import AuthShowcase from './_components/AuthShowcase';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        // data-slot="auth-shell": layout gốc bỏ padding để trang phủ kín màn hình
        <div data-slot="auth-shell" className="flex lg:grid flex-col lg:grid-cols-2 gap-4 lg:gap-6 p-4 sm:p-6 min-h-dvh">
            <AuthShowcase />
            <main className="flex flex-1 justify-center items-start lg:items-center lg:py-6">{children}</main>
        </div>
    );
}
