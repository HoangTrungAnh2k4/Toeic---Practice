import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from 'cn';

export const buttonVariants = cva(
    // base: neo-brutalism style dùng chung
    'inline-flex items-center justify-center cursor-pointer rounded-lg border-2 border-black text-sm font-bold ring-offset-background ' +
        'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ' +
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ' +
        'active:translate-x-[4px] active:translate-y-[4px] active:shadow-none ' +
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ' +
        'disabled:pointer-events-none disabled:opacity-50',
    {
        variants: {
            variant: {
                primary: 'bg-sub3 text-black duration-100',
                secondary: 'bg-sub2 text-white duration-100',
                third: ' duration-100',
                outline: 'bg-transparent border-sub3 border-2 text-main duration-100',
            },
            size: {
                sm: 'h-9 px-3',
                md: 'h-10 px-4',
                lg: 'h-11 px-6',
            },
        },
        defaultVariants: {
            variant: 'outline',
            size: 'lg',
        },
    },
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export default function Button({ variant, size, className, ...props }: ButtonProps) {
    return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
