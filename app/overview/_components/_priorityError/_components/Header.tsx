'use client';

import { MdArrowForward, MdError } from 'react-icons/md';
import { ERRORS } from '../types';
import Button from '@/components/ui/button';

export default function Header() {
    return (
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
            <div className="flex items-start gap-3">
                <MdError className="text-sub3" size={32} />
                <div>
                    <h3 className="font-semibold text-[1.125rem] text-main leading-6 tracking-wide">
                        {ERRORS.length} lỗi ưu tiên cần khắc phục ngay
                    </h3>
                    <p className="mt-0.5 font-medium text-[0.75rem] text-subText leading-4.5">
                        Được trích xuất từ 5 bài nộp gần nhất theo thang chấm chuẩn hóa ETS
                    </p>
                </div>
            </div>
            <Button onClick={() => {}} variant="primary">
                <span>Xem sổ lỗi</span>
                <MdArrowForward className="text-[16px] transition-transform group-hover:translate-x-0.5" />
            </Button>
        </div>
    );
}
