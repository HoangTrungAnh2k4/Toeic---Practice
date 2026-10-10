import Image from 'next/image';
import { GiBookmarklet } from 'react-icons/gi';
import { LuRoute } from 'react-icons/lu';
import { MdSchool } from 'react-icons/md';

export default function WelcomeBanner() {
    return (
        <div className="bg-main px-12 rounded-xl w-full">
            <div className="flex gap-4 h-full">
                <div className="flex flex-col flex-1 justify-between gap-2 pt-4 pb-6 text-white">
                    <div className="flex justify-center items-center gap-2 bg-sub2 px-3 py-1 rounded-full w-fit font-medium text-sm">
                        <GiBookmarklet size={18} className="mt-0.5" />
                        TOEIC Speaking and Writing
                    </div>
                    <div className="flex flex-col gap-4 mt-2 xl:-mt-4">
                        <p className="font-bold text-4xl tracking-wide">Chào Trung Anh, sẵn sàng luyện tập hôm nay?</p>
                        <p className="text-sub1">
                            Luyện tập mỗi ngày, nâng cao kỹ năng Speaking & Writing và tự tin chinh phục mục tiêu TOEIC
                            SW.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        <button className="hover:bg-sub3 px-4 py-2 border-2 border-sub3 rounded-xl font-medium text-sub3 hover:text-white duration-300 ease-in-out cursor-pointer">
                            Bắt đầu luyện tập
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border-2 border-white/20 hover:border-white rounded-xl font-medium text-white/80 hover:text-white duration-300 ease-in-out cursor-pointer">
                            <LuRoute /> Xem lộ trình
                        </button>
                    </div>
                </div>
                <Image
                    src="/img/banner.png"
                    alt="Learnly Logo"
                    width={250}
                    height={200}
                    className="object-contain group-hover:scale-102 transition-transform duration-300"
                />
            </div>
            <div className=""></div>
        </div>
    );
}
