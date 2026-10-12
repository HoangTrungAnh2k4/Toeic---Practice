import Button from '@/components/ui/button';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function Footer() {
    return (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-2 bg-[#E8E5F5]/60 px-4 py-3 border-[#8B84B8]/20 border-t">
            <span className="font-medium text-[#333] text-xs">
                Hiển thị 22 trong tổng số 28 lượt làm bài đã ghi nhận
            </span>
            <div className="flex items-center gap-1">
                <Button type="button" variant="outline" aria-label="Trang trước">
                    <MdChevronLeft className="size-4.5" />
                </Button>
                <span className="px-2 font-semibold text-[#3C3454] text-xs">Trang 1 / 7</span>
                <Button type="button" variant="secondary" aria-label="Trang tiếp">
                    <MdChevronRight className="size-4.5" />
                </Button>
            </div>
        </div>
    );
}
