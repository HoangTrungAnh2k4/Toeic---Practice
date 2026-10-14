'use client';

import { useId } from 'react';
import { LuThumbsDown, LuThumbsUp } from 'react-icons/lu';
import Button from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckStatus } from '../types';

interface ResultConfirmProps {
    question: string;
    passLabel: string;
    failLabel: string;
    value: CheckStatus;
    onChange: (status: CheckStatus) => void;
}

/** Cặp nút để người dùng tự xác nhận kết quả của bước kiểm tra cần cảm nhận bằng tai. */
export default function ResultConfirm({ question, passLabel, failLabel, value, onChange }: ResultConfirmProps) {
    const questionId = useId();
    const isPassed = value === 'passed';
    const isFailed = value === 'failed';

    return (
        <div role="group" aria-labelledby={questionId} className="flex flex-col gap-3 bg-sub1/40 p-4 rounded-lg">
            <p id={questionId} className="font-semibold text-main text-sm">
                {question}
            </p>
            <div className="flex flex-wrap gap-3">
                <Button
                    type="button"
                    variant={isPassed ? 'primary' : 'third'}
                    size="sm"
                    aria-pressed={isPassed}
                    onClick={() => onChange('passed')}
                    className={cn('gap-2', !isPassed && 'bg-white')}
                >
                    <LuThumbsUp className="size-4" aria-hidden="true" />
                    {passLabel}
                </Button>
                <Button
                    type="button"
                    variant="third"
                    size="sm"
                    aria-pressed={isFailed}
                    onClick={() => onChange('failed')}
                    className={cn('gap-2', isFailed ? 'bg-destructive hover:bg-destructive text-white' : 'bg-white')}
                >
                    <LuThumbsDown className="size-4" aria-hidden="true" />
                    {failLabel}
                </Button>
            </div>
        </div>
    );
}
