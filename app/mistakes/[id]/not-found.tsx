import { LuArrowLeft, LuSearch } from 'react-icons/lu';
import LinkButton from '@/components/ui/link-button';
import { MISTAKES_PATH } from '../utils';

export default function MistakeNotFound() {
    return (
        <div className="flex flex-col items-center gap-3 bg-card shadow-sm mx-auto px-4 py-12 border border-sub2/30 rounded-xl w-full max-w-360 text-center">
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                <LuSearch className="size-6" aria-hidden="true" />
            </span>
            <h1 className="font-semibold text-main text-base">Không tìm thấy lỗi này</h1>
            <p className="max-w-md text-subText text-xs">
                Lỗi có thể đã được gộp vào một mẫu lỗi khác, hoặc đường dẫn không còn đúng.
            </p>
            <LinkButton href={MISTAKES_PATH} variant="primary" size="sm" className="gap-2 mt-2 text-xs">
                <LuArrowLeft className="size-4" aria-hidden="true" />
                Về sổ lỗi
            </LinkButton>
        </div>
    );
}
