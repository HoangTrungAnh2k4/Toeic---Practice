'use client';

import { useEffect } from 'react';
import { LuRefreshCw, LuTriangleAlert } from 'react-icons/lu';
import Button from '@/components/ui/button';

interface ErrorPageProps {
    error: Error & { digest?: string };
    retry: () => void;
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div
            role="alert"
            className="flex flex-col items-center gap-3 bg-card shadow-sm mx-auto px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center"
        >
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-destructive">
                <LuTriangleAlert className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-semibold text-main text-base">Đã có lỗi xảy ra</h1>
            <p className="max-w-md text-subText text-xs">Trang chưa tải được. Hãy thử lại sau giây lát.</p>
            <Button variant="primary" size="sm" onClick={retry} className="gap-2 mt-2 text-xs">
                <LuRefreshCw className="size-4" aria-hidden="true" />
                Thử lại
            </Button>
        </div>
    );
}
