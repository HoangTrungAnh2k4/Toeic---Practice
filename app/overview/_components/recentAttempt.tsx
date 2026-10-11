'use client';

import { useState } from 'react';
import { MdChevronLeft, MdChevronRight, MdEditNote, MdHistory, MdMic, MdPlayArrow, MdVisibility } from 'react-icons/md';

type Skill = 'S' | 'W';
type SkillFilter = 'all' | 'speaking' | 'writing';
type AttemptStatus = 'done' | 'pending-sync' | 'interrupted';

interface Attempt {
    id: string;
    title: string;
    subtitle: string;
    skills: Skill[];
    mode: string;
    examType: string;
    retake?: boolean;
    status: AttemptStatus;
    date: string;
}

const ATTEMPTS: Attempt[] = [
    {
        id: 'test-04-part-2',
        title: 'Test 04 — Part 2: Describe a Picture',
        subtitle: 'Đề ETS Format 2024 • 2 câu',
        skills: ['S'],
        mode: 'Học có hướng dẫn',
        examType: 'Đề chưa gặp',
        status: 'done',
        date: 'Hôm nay, 10:45',
    },
    {
        id: 'test-02-part-3',
        title: 'Test 02 — Part 3: Write an Opinion Essay',
        subtitle: 'Đề chủ đề Remote Work Policy • 30 phút',
        skills: ['W'],
        mode: 'Thi thử',
        examType: 'Đề chưa gặp',
        status: 'pending-sync',
        date: 'Hôm qua, 21:15',
    },
    {
        id: 'test-01-part-5',
        title: 'Test 01 — Part 5: Express an Opinion',
        subtitle: 'Đề tái luyện phát âm & liên kết • 1 câu',
        skills: ['S'],
        mode: 'Học có hướng dẫn',
        examType: 'Làm lại',
        retake: true,
        status: 'done',
        date: '2 ngày trước',
    },
    {
        id: 'test-03-full',
        title: 'Test 03 — Full Mock Test SW',
        subtitle: 'Mô phỏng kỳ thi 80 phút hoàn chỉnh',
        skills: ['S', 'W'],
        mode: 'Thi thử',
        examType: 'Đề chưa gặp',
        status: 'interrupted',
        date: '3 ngày trước',
    },
];

const STATUS_STYLE: Record<AttemptStatus, { label: string; badge: string; dot: string }> = {
    done: {
        label: 'Hoàn thành',
        badge: 'bg-[#99efe5]/40 text-[#00504a]',
        dot: 'bg-[#006a63]',
    },
    'pending-sync': {
        label: 'Chờ đồng bộ',
        badge: 'bg-[#ffdbca] text-[#331200]',
        dot: 'bg-[#733100]',
    },
    interrupted: {
        label: 'Bị gián đoạn',
        badge: 'bg-[#ffdad6] text-[#93000a]',
        dot: 'bg-[#ba1a1a]',
    },
};

export default function RecentAttempt() {
    const [filter, setFilter] = useState<SkillFilter>('all');

    const visibleAttempts = ATTEMPTS.filter((a) => {
        if (filter === 'speaking') return a.skills.includes('S');
        if (filter === 'writing') return a.skills.includes('W');
        return true;
    });

    function SkillBadge({ skill }: { skill: Skill }) {
        return skill === 'S' ? (
            <span className="bg-[#0037b0]/10 px-1 py-0.5 rounded-xs font-semibold text-[#0037b0] text-[0.6875rem] leading-3.5 tracking-wider">
                S
            </span>
        ) : (
            <span className="bg-[#006a63]/15 px-1 py-0.5 rounded-xs font-semibold text-[#006a63] text-[0.6875rem] leading-3.5 tracking-wider">
                W
            </span>
        );
    }

    const filterBtn = (key: SkillFilter, label: string) => (
        <button
            type="button"
            onClick={() => setFilter(key)}
            className={
                filter === key
                    ? 'px-1 py-1 rounded-xs bg-[#0037b0] text-white text-[0.6875rem] leading-3.5 tracking-wider font-semibold'
                    : 'px-1 py-1 rounded-xs bg-[#e5eeff] text-[#434655] hover:bg-[#dbe9ff] text-[0.6875rem] leading-3.5 tracking-wider font-semibold'
            }
        >
            {label}
        </button>
    );

    return (
        <div className="flex flex-col gap-4">
            <div className="flex sm:flex-row flex-col justify-between sm:items-center gap-1">
                <div>
                    <h3 className="flex items-center gap-1 font-semibold text-[#0b1c2f] text-[1.125rem] leading-[1.5rem] tracking-[-0.01em]">
                        <MdHistory className="text-[#0037b0] text-[22px]" />
                        <span>Hoạt động gần đây (Recent Attempts)</span>
                    </h3>
                    <p className="text-[#434655] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                        4 lượt làm gần nhất với dữ liệu chi tiết bài nộp và âm thanh lưu trữ
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-wider">
                        Lọc kỹ năng:
                    </span>
                    {filterBtn('all', 'Tất cả')}
                    {filterBtn('speaking', 'Speaking')}
                    {filterBtn('writing', 'Writing')}
                </div>
            </div>

            <div className="bg-white shadow-sm rounded-[0.5rem] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#eef4ff] font-semibold text-[#434655] text-[0.6875rem] uppercase leading-3.5 tracking-wider">
                                <th className="px-4 py-4">Bài luyện</th>
                                <th className="px-4 py-4">Kỹ năng</th>
                                <th className="px-4 py-4">Chế độ</th>
                                <th className="px-4 py-4">Loại đề</th>
                                <th className="px-4 py-4">Trạng thái</th>
                                <th className="px-4 py-4">Ngày thực hiện</th>
                                <th className="px-4 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#c4c5d7]/20 text-[#0b1c2f] text-[0.75rem] leading-4.5 tracking-[0.005em]">
                            {visibleAttempts.map((a) => {
                                const st = STATUS_STYLE[a.status];
                                return (
                                    <tr key={a.id} className="hover:bg-[#eef4ff]/60 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-[#0b1c2f] text-[0.875rem] leading-[1.25rem] tracking-[0.01em]">
                                                    {a.title}
                                                </span>
                                                <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-wider">
                                                    {a.subtitle}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                {a.skills.length === 1 ? (
                                                    a.skills[0] === 'S' ? (
                                                        <span className="inline-flex items-center gap-1 bg-[#0037b0]/10 px-1 py-0.5 rounded-xs font-semibold text-[#0037b0] text-[0.6875rem] leading-3.5 tracking-wider">
                                                            <MdMic className="text-[14px]" />
                                                            Speaking
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 bg-[#006a63]/15 px-1 py-0.5 rounded-xs font-semibold text-[#006a63] text-[0.6875rem] leading-3.5 tracking-wider">
                                                            <MdEditNote className="text-[14px]" />
                                                            Writing
                                                        </span>
                                                    )
                                                ) : (
                                                    a.skills.map((s) => <SkillBadge key={s} skill={s} />)
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span className="font-semibold text-[#0b1c2f] text-[0.75rem] leading-4 tracking-[0.04em]">
                                                {a.mode}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={
                                                    a.retake
                                                        ? 'px-1 py-0.5 rounded-xs bg-[#dbe9ff] text-[#0037b0] text-[0.6875rem] leading-3.5 tracking-wider font-semibold'
                                                        : 'px-1 py-0.5 rounded-xs bg-[#e5eeff] text-[#434655] text-[0.6875rem] leading-3.5 tracking-wider font-semibold'
                                                }
                                            >
                                                {a.examType}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center gap-1.5 px-1 py-0.5 rounded-xs text-[0.6875rem] leading-3.5 tracking-wider font-semibold ${st.badge}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-[0.75rem] ${st.dot}`} />
                                                {st.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 text-[#434655] whitespace-nowrap">{a.date}</td>
                                        <td className="px-4 py-4 text-right whitespace-nowrap">
                                            {a.status === 'interrupted' ? (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 bg-[#1d4ed8] hover:bg-[#0037b0] shadow-sm px-2 py-1.5 rounded-[0.25rem] font-semibold text-[0.75rem] text-white leading-4 tracking-[0.04em] transition-colors"
                                                >
                                                    <MdPlayArrow className="text-[16px]" />
                                                    <span>Làm tiếp</span>
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    className="inline-flex items-center gap-1 bg-[#e5eeff] hover:bg-[#dbe9ff] shadow-sm px-2 py-1.5 rounded-[0.25rem] font-semibold text-[#0037b0] text-[0.75rem] leading-4 tracking-[0.04em] transition-colors"
                                                >
                                                    <MdVisibility className="text-[16px]" />
                                                    <span>Xem lại & Sửa lỗi</span>
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="flex sm:flex-row flex-col justify-between items-center gap-2 bg-[#eef4ff] px-4 py-2">
                    <span className="font-semibold text-[#434655] text-[0.6875rem] leading-3.5 tracking-wider">
                        Hiển thị 22 trong tổng số 28 lượt làm bài đã ghi nhận
                    </span>
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            aria-label="Trang trước"
                            disabled
                            className="flex justify-center items-center bg-white hover:bg-[#e5eeff] disabled:opacity-50 rounded-xs w-8 h-8 text-[#434655]"
                        >
                            <MdChevronLeft className="text-[18px]" />
                        </button>
                        <span className="px-2 font-semibold text-[#0b1c2f] text-[0.6875rem] leading-3.5 tracking-wider">
                            Trang 1 / 7
                        </span>
                        <button
                            type="button"
                            aria-label="Trang tiếp"
                            className="flex justify-center items-center bg-white hover:bg-[#e5eeff] rounded-xs w-8 h-8 text-[#434655]"
                        >
                            <MdChevronRight className="text-[18px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
