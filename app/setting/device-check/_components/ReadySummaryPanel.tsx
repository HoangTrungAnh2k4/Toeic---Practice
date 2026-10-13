import { LuArrowLeft, LuRotateCcw } from 'react-icons/lu';
import Button from '@/components/ui/button';
import LinkButton from '@/components/ui/link-button';
import { SETTING_BASE_PATH } from '@/app/setting/utils';
import { CheckStatuses, StepId } from '../types';
import { CHECK_IDS, SKILL_READINESS } from '../utils';
import CheckNotice from './CheckNotice';
import SkillReadinessCard from './SkillReadinessCard';

interface ReadySummaryPanelProps {
    statuses: CheckStatuses;
    onSelectStep: (step: StepId) => void;
    onRestart: () => void;
}

export default function ReadySummaryPanel({ statuses, onSelectStep, onRestart }: ReadySummaryPanelProps) {
    const passedCount = CHECK_IDS.filter((id) => statuses[id] === 'passed').length;
    const hasFailed = CHECK_IDS.some((id) => statuses[id] === 'failed');
    const isAllPassed = passedCount === CHECK_IDS.length;

    return (
        <div className="flex flex-col gap-5">
            {isAllPassed ? (
                <CheckNotice tone="success" title="Thiết bị đã sẵn sàng cho phòng thi">
                    Tai nghe, micro và bàn phím đều hoạt động tốt. Chúc bạn luyện thi hiệu quả!
                </CheckNotice>
            ) : (
                <CheckNotice
                    tone={hasFailed ? 'warning' : 'info'}
                    title={`Đã đạt ${passedCount}/${CHECK_IDS.length} mục kiểm tra`}
                >
                    {hasFailed
                        ? 'Một số mục chưa đạt. Xem gợi ý xử lý rồi kiểm tra lại trước khi vào thi.'
                        : 'Hoàn tất các mục còn lại để chắc chắn thiết bị hoạt động ổn định khi vào thi.'}
                </CheckNotice>
            )}

            <div className="gap-4 grid grid-cols-1 @xl:grid-cols-2">
                {SKILL_READINESS.map((skill) => (
                    <SkillReadinessCard key={skill.id} skill={skill} statuses={statuses} onSelectStep={onSelectStep} />
                ))}
            </div>

            <div className="flex flex-wrap gap-3">
                <Button type="button" variant="third" size="md" onClick={onRestart} className="gap-2 bg-white">
                    <LuRotateCcw className="size-4" aria-hidden="true" />
                    Kiểm tra lại từ đầu
                </Button>
                <LinkButton href={SETTING_BASE_PATH} variant="third" size="md" className="gap-2 bg-white">
                    <LuArrowLeft className="size-4" aria-hidden="true" />
                    Quay lại Cài đặt
                </LinkButton>
            </div>
        </div>
    );
}
