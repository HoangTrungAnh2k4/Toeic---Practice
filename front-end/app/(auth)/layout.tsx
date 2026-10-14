import { LuGraduationCap } from 'react-icons/lu';
import AuthShowcase from './_components/AuthShowcase';

export default function AuthLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div data-slot="auth-shell" className="flex flex-col bg-[#eef0fc] bg-dots px-4 sm:px-8 pt-8 pb-12 min-h-dvh">
            <div className="flex lg:flex-row flex-col flex-1 lg:items-start gap-10 lg:gap-14 mx-auto w-full max-w-6xl">
                <AuthShowcase />
                <main className="flex justify-center lg:w-115 lg:shrink-0">{children}</main>
            </div>
        </div>
    );
}
