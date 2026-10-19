'use client';

import Image from 'next/image';
import { type ClipboardEvent, useEffect, useRef, useState } from 'react';
import { LuImageUp, LuTrash2 } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { IMAGE_TYPES, MAX_IMAGE_MB } from '../../_lib/examSchema';
import type { ControlProps } from './FormField';

interface ImageUploadFieldProps {
    control: ControlProps;
    /** Ảnh chỉ nằm trong RAM; tải lên R2 khi lưu đề. */
    value: File | null;
    /** Alt cho ảnh xem trước. */
    alt: string;
    onChange: (file: File | null) => void;
    onBlur: () => void;
}

export default function ImageUploadField({ control, value, alt, onChange, onBlur }: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');

    // Data URL thay cho object URL: không phải revoke, nên không vỡ preview khi StrictMode chạy effect hai lần
    useEffect(() => {
        if (!value) return;
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(String(reader.result));
        reader.readAsDataURL(value);
        return () => reader.abort();
    }, [value]);

    const pick = (file: File | undefined) => {
        if (!file) return;
        if (!(IMAGE_TYPES as readonly string[]).includes(file.type))
            return setError('Chỉ nhận ảnh JPG, PNG hoặc WebP.');
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) return setError(`Ảnh tối đa ${MAX_IMAGE_MB} MB.`);
        setError('');
        onChange(file);
    };

    const onPaste = (event: ClipboardEvent) => {
        const file = Array.from(event.clipboardData.files).find((item) => item.type.startsWith('image/'));
        if (!file) return;
        event.preventDefault();
        pick(file);
    };

    return (
        <div
            tabIndex={0}
            onPaste={onPaste}
            aria-label="Vùng dán ảnh"
            className="flex sm:flex-row flex-col sm:items-center gap-4 p-4 border-2 border-sub2/30 focus-visible:border-sub2 border-dashed rounded-lg focus-visible:outline-none"
        >
            <div className="relative flex justify-center items-center bg-sub1 rounded-lg w-full sm:w-48 aspect-4/3 overflow-hidden shrink-0">
                {value && previewUrl ? (
                    <Image src={previewUrl} alt={alt} fill unoptimized className="object-cover" />
                ) : (
                    <LuImageUp className="size-8 text-sub2" aria-hidden="true" />
                )}
            </div>

            <div className="flex flex-col items-start gap-2">
                <p className="font-medium text-subText text-sm">
                    Dán ảnh (Ctrl+V) vào khung này hoặc chọn từ máy. JPG, PNG, WebP tối đa {MAX_IMAGE_MB} MB.
                </p>
                <div className="flex flex-wrap gap-2">
                    <Button
                        {...control}
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="gap-2"
                        onClick={() => inputRef.current?.click()}
                        onBlur={onBlur}
                    >
                        <LuImageUp className="size-4" aria-hidden="true" />
                        {value ? 'Đổi ảnh' : 'Chọn ảnh'}
                    </Button>
                    {value && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => {
                                setError('');
                                onChange(null);
                            }}
                        >
                            <LuTrash2 className="size-4" aria-hidden="true" />
                            Xóa ảnh
                        </Button>
                    )}
                </div>
                <input
                    ref={inputRef}
                    type="file"
                    accept={IMAGE_TYPES.join(',')}
                    hidden
                    onChange={(event) => {
                        pick(event.target.files?.[0]);
                        // Cho phép chọn lại cùng file sau khi xoá
                        event.target.value = '';
                    }}
                />
                <p role="status" className="font-medium text-destructive text-sm">
                    {error}
                </p>
            </div>
        </div>
    );
}
