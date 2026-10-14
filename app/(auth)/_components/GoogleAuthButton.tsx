import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/ui/button';

interface GoogleAuthButtonProps {
    label: string;
}

export default function GoogleAuthButton({ label }: GoogleAuthButtonProps) {
    return (
        <Button
            type="button"
            variant="third"
            size={'lg'}
            className="hover:bg-white hover:text-black"
        >
            <FcGoogle aria-hidden="true" className="size-5" />
            {label}
        </Button>
    );
}
