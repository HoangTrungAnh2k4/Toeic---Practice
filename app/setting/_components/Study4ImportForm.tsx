'use client';

import { FormEvent, useRef } from 'react';
import { LuBot, LuLink, LuLoaderCircle, LuX } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface Study4ImportFormProps {
    url: string;
    error: string | null;
    isParsing: boolean;
    onUrlChange: (value: string) => void;
    onSubmit: () => void;
}

const INPUT_ID = 'study4-url';
const ERROR_ID = 'study4-url-error';

export default function Study4ImportForm({ url, error, isParsing, onUrlChange, onSubmit }: Study4ImportFormProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        onSubmit();
    };

    const handleClear = () => {
        onUrlChange('');
        inputRef.current?.focus();
    };

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-1.5">
            <label htmlFor={INPUT_ID} className="font-semibold text-main text-xs">
                Link bài kiểm tra Study4
            </label>
            <div className="flex lg:flex-row flex-col gap-3">
                <div className="relative flex-1">
                    <LuLink
                        className="top-1/2 left-3 absolute size-4 text-sub2 -translate-y-1/2 pointer-events-none"
                        aria-hidden="true"
                    />
                    <Input
                        ref={inputRef}
                        id={INPUT_ID}
                        type="url"
                        inputMode="url"
                        autoComplete="off"
                        value={url}
                        disabled={isParsing}
                        onChange={(event) => onUrlChange(event.target.value)}
                        placeholder="https://study4.com/tests/..."
                        aria-invalid={error ? true : undefined}
                        aria-describedby={error ? ERROR_ID : undefined}
                        className="bg-sub1/50 focus-visible:bg-white px-9 border-sub2/40 focus-visible:border-main focus-visible:ring-sub3/60 h-11 text-main md:text-sm placeholder:text-sub2"
                    />
                    {url && !isParsing && (
                        <button
                            type="button"
                            onClick={handleClear}
                            aria-label="Xóa link"
                            className="top-1/2 right-2 absolute flex justify-center items-center hover:bg-sub1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring size-7 text-sub2 hover:text-main transition-colors -translate-y-1/2 cursor-pointer"
                        >
                            <LuX className="size-4" aria-hidden="true" />
                        </button>
                    )}
                </div>

                <Button type="submit" variant="primary" size="lg" disabled={isParsing} className="gap-2 shrink-0">
                    {isParsing ? (
                        <LuLoaderCircle className="size-4 motion-safe:animate-spin" aria-hidden="true" />
                    ) : (
                        <LuBot className="size-4" aria-hidden="true" />
                    )}
                    <span>{isParsing ? 'Đang bóc tách…' : 'Bóc tách bằng AI'}</span>
                </Button>
            </div>
            <p
                id={error ? ERROR_ID : undefined}
                className={cn('font-medium text-xs', error ? 'text-destructive' : 'text-subText')}
            >
                {error ?? 'AI tự nhận diện audio prompt, ảnh, bảng dữ liệu và chuẩn hóa thời gian theo phòng thi IIG.'}
            </p>
        </form>
    );
}
