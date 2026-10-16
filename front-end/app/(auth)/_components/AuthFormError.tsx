import { LuCircleAlert } from 'react-icons/lu';

/** Lỗi chung của form (sai mật khẩu, lỗi mạng...), không gắn với ô nhập nào. */
export default function AuthFormError({ message }: { message?: string }) {
    if (!message) return null;

    return (
        <p role="alert" className="flex items-start gap-2 font-medium text-destructive text-sm">
            <LuCircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            {message}
        </p>
    );
}
