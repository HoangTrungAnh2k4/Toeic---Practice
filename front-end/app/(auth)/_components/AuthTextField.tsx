'use client';

import { useId } from 'react';
import type { IconType } from 'react-icons';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field';
import AuthInput from './AuthInput';

interface AuthTextFieldProps extends Omit<React.ComponentProps<'input'>, 'id'> {
    label: string;
    icon: IconType;
    description?: string;
    error?: string;
}

export default function AuthTextField({ label, icon, description, error, ...inputProps }: AuthTextFieldProps) {
    const id = useId();
    const descriptionId = `${id}-description`;
    const errorId = `${id}-error`;
    const invalid = Boolean(error);
    const describedBy = [description && !invalid && descriptionId, invalid && errorId].filter(Boolean).join(' ');

    return (
        <Field data-invalid={invalid}>
            <FieldLabel htmlFor={id} className="font-medium text-main">
                {label}
            </FieldLabel>
            <AuthInput
                id={id}
                icon={icon}
                aria-invalid={invalid}
                aria-describedby={describedBy || undefined}
                {...inputProps}
            />
            {/* Gợi ý chỉ hiện khi đang nhập và chưa có lỗi; lỗi đã nói rõ hơn */}
            {description && !invalid && (
                <FieldDescription id={descriptionId} className="hidden group-focus-within/field:block">
                    {description}
                </FieldDescription>
            )}
            {invalid && <FieldError id={errorId}>{error}</FieldError>}
        </Field>
    );
}
