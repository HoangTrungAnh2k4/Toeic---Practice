import { LuBrain, LuEye, LuHourglass, LuListOrdered } from 'react-icons/lu';
import { MistakeStatus } from '../types';
import { cn } from '@/lib/utils';
import { STATUS_META, WINDOW_SIZE } from '../utils';

const STATUS_ORDER: MistakeStatus[] = ['active', 'improving', 'resolved'];

const RULES = [
    { Icon: LuListOrdered, label: `Tần suất tính trên tối đa ${WINDOW_SIZE} bài gần nhất có làm dạng câu tương ứng.` },
    { Icon: LuEye, label: 'Bài có xem bài mẫu vẫn ghi nhận lỗi, nhưng không được tính là bằng chứng đã khắc phục.' },
    { Icon: LuHourglass, label: 'Bài đang chấm hoặc bị gián đoạn chưa được đưa vào thống kê.' },
    { Icon: LuBrain, label: 'Nhận xét do AI tạo theo rubric ETS, mang tính tham khảo.' },
];

export default function MistakesHowItWorks() {
    return (
        <section
            aria-labelledby="mistakes-how-title"
            className="flex flex-col gap-5 bg-card shadow-sm p-5 sm:p-6 border border-sub2/30 rounded-xl"
        >
            <div className="flex flex-col gap-1">
                <span className="font-semibold text-subText text-xs uppercase tracking-wider">Cách sổ lỗi hoạt động</span>
                <h2 id="mistakes-how-title" className="font-bold text-main text-xl tracking-tight">
                    Trạng thái được cập nhật tự động sau mỗi bài nộp
                </h2>
            </div>

            <ol className="gap-3 grid grid-cols-1 md:grid-cols-3">
                {STATUS_ORDER.map((status, index) => {
                    const { label, description, Icon, className } = STATUS_META[status];
                    return (
                        <li key={status} className="flex items-start gap-3 bg-sub1/50 p-4 rounded-xl">
                            <span className={cn('flex justify-center items-center rounded-lg size-9 shrink-0', className)}>
                                <Icon className="size-4" aria-hidden="true" />
                            </span>
                            <div className="flex flex-col gap-0.5">
                                <span className="font-bold text-main text-sm">
                                    {index + 1}. {label}
                                </span>
                                <span className="text-subText text-xs leading-relaxed">
                                    {description}
                                    {status === 'resolved' && '. Nếu lỗi xuất hiện lại, nó sẽ tự mở lại.'}
                                </span>
                            </div>
                        </li>
                    );
                })}
            </ol>

            <ul className="flex flex-col gap-2 pt-4 border-sub2/20 border-t font-medium text-subText text-xs">
                {RULES.map(({ Icon, label }) => (
                    <li key={label} className="flex items-start gap-2">
                        <Icon className="mt-px size-4 text-sub2 shrink-0" aria-hidden="true" />
                        {label}
                    </li>
                ))}
            </ul>
        </section>
    );
}
