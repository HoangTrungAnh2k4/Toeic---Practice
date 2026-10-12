import Button from '@/components/ui/button';

type HeaderProps = {
    count: number;
};

export default function Header({ count }: HeaderProps) {
    return (
        <div className="flex sm:flex-row flex-col sm:justify-between sm:items-center gap-3">
            <div className="pl-3 border-sub3 border-l-5">
                <h3 className="font-semibold text-main text-lg leading-6 tracking-wide">
                    {count} lỗi ưu tiên cần khắc phục ngay
                </h3>
                <p className="mt-0.5 font-medium text-subText text-xs leading-4.5">
                    Được trích xuất từ 5 bài nộp gần nhất theo thang chấm chuẩn hóa ETS
                </p>
            </div>
            <Button type="button" variant="primary" size="sm">
                Xem sổ lỗi
            </Button>
        </div>
    );
}
