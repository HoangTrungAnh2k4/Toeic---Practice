import Link from 'next/link';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type LinkButtonProps = React.ComponentProps<typeof Link> & VariantProps<typeof buttonVariants>;

// Link điều hướng mang UI của Button, dùng được trong server component
export default function LinkButton({ variant, size, className, ...props }: LinkButtonProps) {
    return <Link className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
