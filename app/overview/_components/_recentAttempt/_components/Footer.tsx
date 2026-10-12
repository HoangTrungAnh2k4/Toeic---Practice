import Button from '@/components/ui/button';
import { MdChevronLeft, MdChevronRight } from 'react-icons/md';

export default function Footer() {
    return (
        <div className="flex sm:flex-row flex-col justify-between items-center gap-2 bg-white px-4 py-3 border-[#8B84B8]/20 border-t">
            <div></div>
            <div className="flex items-center gap-1">
                <Button className="px-2.5 py-0 h-7" type="button" variant="secondary" aria-label="Trang trước">
                    <MdChevronLeft size={22} />
                </Button>
                <span className="mt-1 px-2 font-semibold text-[#3C3454] text-xs">Trang 1 / 7</span>
                <Button className="px-2.5 py-0 h-7" type="button" variant="secondary" aria-label="Trang tiếp">
                    <MdChevronRight size={22} />
                </Button>
            </div>
        </div>
    );
}
