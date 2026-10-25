'use client';

import { type ReactNode, useId } from 'react';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';

export interface ControlProps {
    id: string;
    'aria-invalid': boolean;
    'aria-describedby': string | undefined;
}

interface FormFieldProps {
    label: string;
    required?: boolean;
    description?: string;
    error?: string;
    /** Nhận id và aria cho ô nhập để nhãn, mô tả và lỗi gắn đúng vào control. */
    children: (control: ControlProps) => ReactNode;
}

export default function FormField({ label, required, description, error, children }: FormFieldProps) {
    const id = useId();
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;
    const invalid = Boolean(error);
    const describedBy = [description && descriptionId, invalid && errorId].filter(Boolean).join(' ');

    return (
        <Field data-invalid={invalid}>
            <FieldLabel htmlFor={id} className="font-medium text-main">
                {label}
                {required && (
                    <span className="text-destructive" aria-hidden="true">
                        *
                    </span>
                )}
            </FieldLabel>
            {children({ id, 'aria-invalid': invalid, 'aria-describedby': describedBy || undefined })}
            {description && <FieldDescription id={descriptionId}>{description}</FieldDescription>}
            {invalid && <FieldError id={errorId}>{error}</FieldError>}
        </Field>
    );
}
