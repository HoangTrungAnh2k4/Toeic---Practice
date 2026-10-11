'use client';
import { useState } from 'react';
import { MdClose, MdCloudSync, MdSync } from 'react-icons/md';

export default function NoticeBanner() {
    const [showNotice, setShowNotice] = useState(true);
    return (
        <div>
            {showNotice && (
                <div className="relative bg-[#dbe9ff] shadow-sm p-4 rounded-[0.5rem] overflow-hidden">
                    <div className="flex sm:flex-row flex-col justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                            <div className="flex justify-center items-center bg-[#d3e4fd] shadow-sm rounded-[0.25rem] w-9 h-9 text-[#0037b0] shrink-0">
                                <MdCloudSync className="text-[20px]" />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1">
                                    <span className="font-semibold text-[#434655] text-[0.6875rem] uppercase leading-3.5 tracking-wider">
                                        Cảnh báo hệ thống
                                    </span>
                                    <span className="bg-[#733100] rounded-[0.75rem] w-1.5 h-1.5" />
                                    <span className="font-semibold text-[#733100] text-[0.6875rem] leading-3.5 tracking-wider">
                                        Chế độ Offline First
                                    </span>
                                </div>
                                <p className="text-[#0b1c2f] text-[0.875rem] truncate leading-5.5">
                                    Dữ liệu demo lưu trên trình duyệt (
                                    <span className="font-semibold text-[#0037b0]">Local Cache</span>) — Chưa đồng bộ
                                    tài khoản cloud.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center self-end sm:self-auto gap-2 shrink-0">
                            <button
                                type="button"
                                className="flex items-center gap-1 bg-white hover:bg-[#e5eeff] shadow-sm px-2 py-1 rounded-[0.25rem] font-semibold text-[#0b1c2f] text-[0.75rem] leading-4 tracking-[0.04em] transition-colors"
                            >
                                <MdSync className="text-[16px]" />
                                <span>Đồng bộ ngay</span>
                            </button>
                            <button
                                type="button"
                                aria-label="Đóng thông báo"
                                onClick={() => setShowNotice(false)}
                                className="flex justify-center items-center bg-[#e5eeff] hover:bg-[#d3e4fd] rounded-[0.25rem] w-8 h-8 text-[#434655] transition-colors"
                            >
                                <MdClose className="text-[18px]" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
