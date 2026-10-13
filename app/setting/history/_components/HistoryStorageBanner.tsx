import { LuDownload, LuShieldCheck, LuTrash2 } from 'react-icons/lu';
import Button from '@/components/ui/button';

export default function HistoryStorageBanner() {
    return (
        <div className="flex xl:flex-row flex-col justify-between items-start xl:items-center gap-4 bg-sub1 p-5 border border-sub2/30 rounded-xl">
            <div className="flex items-start gap-3 max-w-3xl">
                <div className="flex justify-center items-center bg-main rounded-full size-10 text-sub3 shrink-0">
                    <LuShieldCheck className="size-5" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-main text-sm">Bảo mật dữ liệu & Bộ nhớ đệm cục bộ</span>
                        <span className="bg-main px-2 py-0.5 rounded-md font-semibold text-sub3 text-[11px]">
                            Chuẩn ETS Test Safe
                        </span>
                    </div>
                    <p className="font-medium text-subText text-xs leading-relaxed">
                        Toàn bộ bản ghi âm thanh và văn bản luyện thi được bảo vệ và đồng bộ liên tục về máy chủ
                        SpeakWrite. Bạn có thể trích xuất bản ghi JSON thô, tệp âm thanh WAV hoặc giải phóng bộ nhớ
                        IndexedDB trên máy tính phòng thi này bất kỳ lúc nào.
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap justify-end items-center gap-3 self-stretch xl:self-auto shrink-0">
                <Button type="button" size="sm" variant="primary" className="gap-2">
                    <LuDownload className="size-4" aria-hidden="true" />
                    <span>Xuất dữ liệu</span>
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="third"
                    className="gap-2 bg-white hover:bg-destructive"
                >
                    <LuTrash2 className="size-4" aria-hidden="true" />
                    <span>Giải phóng cache</span>
                </Button>
            </div>
        </div>
    );
}
