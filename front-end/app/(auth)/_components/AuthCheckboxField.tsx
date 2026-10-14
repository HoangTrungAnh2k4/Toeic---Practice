'use client';

import { useId } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { cn } from '@/lib/utils';

interface AuthCheckboxFieldProps extends Omit<React.ComponentProps<typeof Checkbox>, 'id'> {
    label: React.ReactNode;
    error?: string;
}

export default function AuthCheckboxField({ label, error, className, ...props }: AuthCheckboxFieldProps) {
    const id = useId();
    const errorId = `${id}-error`;
    const invalid = Boolean(error);

    return (
        <Field orientation="horizontal" data-invalid={invalid} className="cursor-pointer">
            <Checkbox
                id={id}
                aria-invalid={invalid}
                aria-describedby={invalid ? errorId : undefined}
                className={cn('data-checked:bg-main border-sub2 data-checked:border-main', className)}
                {...props}
            />
            <FieldContent>
                <FieldLabel htmlFor={id} className="font-normal text-main leading-snug cursor-pointer">
                    {label}
                </FieldLabel>
                {invalid && <FieldError id={errorId}>{error}</FieldError>}
            </FieldContent>
        </Field>
    );
}
