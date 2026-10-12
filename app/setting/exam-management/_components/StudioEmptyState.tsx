import { LuFileSearch } from 'react-icons/lu';

export default function StudioEmptyState() {
    return (
        <div className="flex flex-col items-center gap-2 bg-white shadow-sm px-6 py-12 border border-sub2/40 border-dashed rounded-xl text-center">
            <span className="flex justify-center items-center bg-sub1 rounded-full size-12 text-sub2">
                <LuFileSearch className="size-6" aria-hidden="true" />
            </span>
            <p className="font-semibold text-main text-sm">Chưa có bản thảo nào đang mở</p>
            <p className="max-w-sm text-subText text-xs leading-relaxed">
                Dán link bài kiểm tra Study4 ở ô phía trên và bấm “Bóc tách bằng AI” để mở Studio biên tập từng Part.
            </p>
        </div>
    );
}
