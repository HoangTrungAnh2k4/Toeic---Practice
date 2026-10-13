import { FcGoogle } from 'react-icons/fc';
import { LuLoaderCircle } from 'react-icons/lu';
import Button from '@/components/ui/button';

interface GoogleAuthButtonProps {
    label: string;
    pending: boolean;
    disabled: boolean;
    onClick: () => void;
}

export default function GoogleAuthButton({ label, pending, disabled, onClick }: GoogleAuthButtonProps) {
    return (
        <Button
            type="button"
            variant="third"
            onClick={onClick}
            disabled={disabled}
            aria-busy={pending}
            size={'lg'}
            className="hover:bg-white hover:text-black"
        >
            {pending ? (
                <LuLoaderCircle aria-hidden="true" className="size-5 motion-safe:animate-spin" />
            ) : (
                <FcGoogle aria-hidden="true" className="size-5" />
            )}
            {label}
        </Button>
    );
}
