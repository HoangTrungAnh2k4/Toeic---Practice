'use client';

import { MdVerifiedUser } from 'react-icons/md';

export default function FooterAssurance() {
    return (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-4 bg-[#eef4ff] p-4 rounded-[0.5rem]">
            <div className="flex items-center gap-2">
                <MdVerifiedUser className="text-[#006a63] text-[24px]" />
                <div className="flex flex-col">
                    <span className="font-semibold text-[#0b1c2f] text-[0.75rem] leading-4 tracking-[0.04em]">
                        Hệ thống đo lường đáp ứng chuẩn ETS Test Specifications
                    </span>
                    <span className="text-[#434655] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                        Bộ đề thi & thuật toán chấm phản ánh đúng tiêu chí Phát âm, Trọng âm, Ngữ pháp và Tính mạch lạc.
                    </span>
                </div>
            </div>
            <button
                type="button"
                onClick={() => {}}
                className="font-semibold text-[#0037b0] text-[0.75rem] hover:underline leading-4 tracking-[0.04em] whitespace-nowrap"
            >
                Kiểm tra âm thanh phòng thi →
            </button>
        </div>
    );
}
