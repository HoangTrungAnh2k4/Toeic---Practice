'use client';

import Image from 'next/image';
import { type DragEvent, useEffect, useEffectEvent, useRef, useState } from 'react';
import { LuImageUp, LuLoaderCircle, LuRefreshCw, LuTrash2 } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { compressImage } from '@/lib/image/compress';
import { cn } from '@/lib/utils';
import { IMAGE_TYPES, MAX_IMAGE_MB, MAX_SOURCE_IMAGE_MB } from '../../_lib/examSchema';
import type { ControlProps } from './FormField';

interface ImageUploadFieldProps {
    control: ControlProps;
    /** Ảnh đã nén, chỉ nằm trong RAM; tải lên R2 khi lưu đề. */
    value: File | null;
    /** Ảnh đang có trên R2 (sửa đề); ảnh mới chọn thì thay ảnh này khi lưu. */
    existingUrl?: string | null;
    /** Alt cho ảnh xem trước. */
    alt: string;
    onChange: (file: File | null) => void;
    onRemoveExisting?: () => void;
    onBlur: () => void;
}

export default function ImageUploadField({
    control,
    value,
    existingUrl,
    alt,
    onChange,
    onRemoveExisting,
    onBlur,
}: ImageUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const rootRef = useRef<HTMLDivElement>(null);
    const hoveredRef = useRef(false);
    const [previewUrl, setPreviewUrl] = useState('');
    const [error, setError] = useState('');
    const [compressing, setCompressing] = useState(false);
    const [dragging, setDragging] = useState(false);

    // Data URL thay cho object URL: không phải revoke, nên không vỡ preview khi StrictMode chạy effect hai lần
    useEffect(() => {
        if (!value) return;
        const reader = new FileReader();
        reader.onload = () => setPreviewUrl(String(reader.result));
        reader.readAsDataURL(value);
        return () => reader.abort();
    }, [value]);

    const src = value ? previewUrl : existingUrl;
    const hasImage = Boolean(value || existingUrl);
    // Dán/thả không đi qua nút nên tự kiểm tra: fieldset `disabled` (đề đã có lượt làm) khoá cả input file
    const isDisabled = () => inputRef.current?.matches(':disabled') ?? false;

    /** Nén ngay khi chọn: nhiều ảnh gửi chung một request lưu đề phải dưới giới hạn body của proxy. */
    const pick = async (file: File | undefined) => {
        if (!file || isDisabled()) return;
        if (!(IMAGE_TYPES as readonly string[]).includes(file.type))
            return setError('Chỉ nhận ảnh JPG, PNG hoặc WebP.');
        if (file.size > MAX_SOURCE_IMAGE_MB * 1024 * 1024) return setError(`Ảnh tối đa ${MAX_SOURCE_IMAGE_MB} MB.`);
        setError('');
        setCompressing(true);
        try {
            const compressed = await compressImage(file);
            if (compressed.size > MAX_IMAGE_MB * 1024 * 1024) {
                return setError(`Ảnh sau khi nén vẫn quá ${MAX_IMAGE_MB} MB. Hãy chọn ảnh khác.`);
            }
            onChange(compressed);
        } catch {
            setError('Không đọc được ảnh này. Hãy chọn ảnh khác.');
        } finally {
            setCompressing(false);
        }
    };

    /** Ctrl+V chỉ bắn vào phần tử đang focus: nghe ở document, nhận ảnh khi chuột đang trên khung hoặc focus nằm trong cùng câu. */
    const onDocumentPaste = useEffectEvent((event: globalThis.ClipboardEvent) => {
        const root = rootRef.current;
        if (!root || event.defaultPrevented) return;
        const file = Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith('image/'));
        if (!file) return;
        const question = root.closest('fieldset') ?? root;
        if (!hoveredRef.current && !question.contains(event.target as Node)) return;
        event.preventDefault();
        void pick(file);
    });

    useEffect(() => {
        const listener = (event: globalThis.ClipboardEvent) => onDocumentPaste(event);
        document.addEventListener('paste', listener);
        return () => document.removeEventListener('paste', listener);
    }, []);

    const onDragOver = (event: DragEvent) => {
        if (!event.dataTransfer.types.includes('Files') || isDisabled()) return;
        event.preventDefault();
        setDragging(true);
    };

    const onDrop = (event: DragEvent) => {
        event.preventDefault();
        setDragging(false);
        void pick(event.dataTransfer.files[0]);
    };

    return (
        <div
            ref={rootRef}
            tabIndex={0}
            onPointerEnter={() => (hoveredRef.current = true)}
            onPointerLeave={() => (hoveredRef.current = false)}
            onDragOver={onDragOver}
            // Rời vào phần tử con cũng bắn dragleave: chỉ tắt khi chuột ra hẳn khỏi khung
            onDragLeave={(event) => {
                if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false);
            }}
            onDrop={onDrop}
            aria-label="Vùng dán hoặc thả ảnh"
            className={cn(
                'flex flex-col bg-white border-2 border-dashed rounded-xl overflow-hidden transition-colors',
                'focus-visible:outline-none focus-visible:border-sub2 focus-visible:ring-2 focus-visible:ring-sub2/30',
                dragging ? 'border-sub3 bg-sub3/10' : error ? 'border-destructive/60' : 'border-sub2/40',
            )}
        >
            <div className="relative flex justify-center items-center bg-canvas/60 w-full aspect-video">
                {src ? (
                    <Image src={src} alt={alt} fill unoptimized loading="eager" className="object-contain" />
                ) : (
                    <div className="flex flex-col items-center gap-2 p-6 text-center">
                        <span
                            className={cn(
                                'flex justify-center items-center rounded-full size-14 transition-colors',
                                dragging ? 'bg-sub3 text-main' : 'bg-sub1 text-main',
                            )}
                            aria-hidden="true"
                        >
                            <LuImageUp className="size-7" />
                        </span>
                        <p className="font-semibold text-main text-sm">
                            {dragging ? 'Thả ảnh vào đây' : 'Kéo thả hoặc dán ảnh (Ctrl+V)'}
                        </p>
                        <p className="font-medium text-subText text-xs">
                            JPG, PNG, WebP tối đa {MAX_SOURCE_IMAGE_MB} MB · tự thu nhỏ trước khi lưu
                        </p>
                    </div>
                )}
                {compressing && (
                    <div className="absolute inset-0 flex justify-center items-center gap-2 bg-white/80 font-semibold text-main text-sm">
                        <LuLoaderCircle className="size-5 animate-spin" aria-hidden="true" />
                        Đang nén ảnh...
                    </div>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2 p-3 border-sub2/20 border-t">
                <Button
                    {...control}
                    type="button"
                    variant={hasImage ? 'third' : 'secondary'}
                    size="sm"
                    className={cn('gap-2', hasImage && 'bg-white')}
                    disabled={compressing}
                    onClick={() => inputRef.current?.click()}
                    onBlur={onBlur}
                >
                    {hasImage ? (
                        <LuRefreshCw className="size-4" aria-hidden="true" />
                    ) : (
                        <LuImageUp className="size-4" aria-hidden="true" />
                    )}
                    {hasImage ? 'Đổi ảnh' : 'Chọn ảnh'}
                </Button>
                {hasImage && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        disabled={compressing}
                        onClick={() => {
                            setError('');
                            // Xoá ảnh mới chọn thì quay về ảnh đang có; không có ảnh mới thì bỏ ảnh đang có
                            if (value) onChange(null);
                            else onRemoveExisting?.();
                        }}
                    >
                        <LuTrash2 className="size-4" aria-hidden="true" />
                        Xóa ảnh
                    </Button>
                )}
                <input
                    ref={inputRef}
                    type="file"
                    accept={IMAGE_TYPES.join(',')}
                    hidden
                    onChange={(event) => {
                        void pick(event.target.files?.[0]);
                        // Cho phép chọn lại cùng file sau khi xoá
                        event.target.value = '';
                    }}
                />
            </div>
            {/* Không ẩn bằng display: live region bị ẩn rồi hiện lại thì trình đọc màn hình hay bỏ qua */}
            <p role="status" className="px-3 pb-3 empty:p-0 font-medium text-destructive text-sm">
                {error}
            </p>
        </div>
    );
}
