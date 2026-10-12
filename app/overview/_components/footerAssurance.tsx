'use client';

import Button from '@/components/ui/button';
import { MdVerifiedUser } from 'react-icons/md';

export default function FooterAssurance() {
    return (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 bg-[#E8E5F5] p-4 border border-sub2/30 rounded-xl">
            <div className="flex items-center gap-3">
                <div className="flex justify-center items-center bg-main rounded-full w-10 h-10 shrink-0">
                    <MdVerifiedUser className="text-[22px] text-sub3" />
                </div>
                <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-[0.8125rem] text-main leading-5">
                        Hệ thống đo lường đáp ứng chuẩn ETS Test Specifications
                    </span>
                    <span className="font-medium text-[0.75rem] text-subText leading-4.5">
                        Bộ đề thi & thuật toán chấm phản ánh đúng tiêu chí Phát âm, Trọng âm, Ngữ pháp và Tính mạch lạc.
                    </span>
                </div>
            </div>
            <Button type="button" size={'sm'} variant={'primary'} className="py-0" onClick={() => {}}>
                Kiểm tra âm thanh
            </Button>
        </div>
    );
}
