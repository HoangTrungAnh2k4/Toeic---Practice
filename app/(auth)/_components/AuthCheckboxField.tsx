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
        <Field orientation="horizontal" data-invalid={invalid}>
            <Checkbox
                id={id}
                aria-invalid={invalid}
                aria-describedby={invalid ? errorId : undefined}
                className={cn('border-sub2 data-checked:border-main data-checked:bg-main', className)}
                {...props}
            />
            <FieldContent>
                <FieldLabel htmlFor={id} className="font-normal text-subText leading-snug">
                    {label}
                </FieldLabel>
                {invalid && <FieldError id={errorId}>{error}</FieldError>}
            </FieldContent>
        </Field>
    );
}
