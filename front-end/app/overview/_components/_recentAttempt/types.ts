import { MdEditNote, MdMic } from "react-icons/md";

export type Skill = 'S' | 'W';
export type SkillFilter = 'all' | 'speaking' | 'writing';
export type AttemptStatus = 'done' | 'scoring' | 'interrupted';

export interface Attempt {
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

export const ATTEMPTS: Attempt[] = [
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
        status: 'scoring',
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

export const STATUS_STYLE: Record<AttemptStatus, { label: string; badge: string; dot: string }> = {
    done: {
        label: 'Hoàn thành',
        badge: 'bg-[#E8E5F5] text-[#3C3454]',
        dot: 'bg-[#3C3454]',
    },
    scoring: {
        label: 'Đang chấm',
        badge: 'bg-[#F5B841]/25 text-[#3C3454]',
        dot: 'bg-[#F5B841]',
    },
    interrupted: {
        label: 'Bị gián đoạn',
        badge: 'bg-white text-[#3C3454] ring-1 ring-inset ring-[#8B84B8]',
        dot: 'bg-[#8B84B8]',
    },
};

export const SKILL_META: Record<Skill, { label: string; Icon: typeof MdMic }> = {
    S: { label: 'Speaking', Icon: MdMic },
    W: { label: 'Writing', Icon: MdEditNote },
};