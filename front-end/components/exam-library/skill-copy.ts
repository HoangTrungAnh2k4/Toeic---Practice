import type { IconType } from 'react-icons';
import { LuHardDriveDownload, LuHeadphones, LuKeyboard, LuLockKeyhole, LuNotebookPen } from 'react-icons/lu';
import type { Skill } from '@/lib/domain/types';

interface RoomCheck {
    icon: IconType;
    title: string;
    description: string;
}

interface SkillCopy {
    label: string;
    /** "nói" / "viết" — dùng trong câu tiếng Việt. */
    verb: string;
    searchPlaceholder: string;
    roomChecks: RoomCheck[];
    deviceCheckLabel: string;
}

/** Nội dung riêng theo kỹ năng cho các khối dùng chung của thư viện đề. */
export const SKILL_COPY: Record<Skill, SkillCopy> = {
    speaking: {
        label: 'Speaking',
        verb: 'nói',
        searchPlaceholder: 'Tìm theo mã đề (ETS SP-09), tiêu đề hoặc tag...',
        roomChecks: [
            {
                icon: LuHeadphones,
                title: 'Microphone & tai nghe',
                description: 'Tín hiệu sạch, không echo. Nên dùng tai nghe có mic rời.',
            },
            {
                icon: LuLockKeyhole,
                title: 'Quy chế thi máy (CBT)',
                description: 'Tự động ghi âm sau tiếng Beep, không tạm dừng hay nghe lại câu hỏi.',
            },
            {
                icon: LuNotebookPen,
                title: 'Bút & giấy nháp',
                description: 'Chuẩn bị sẵn để ghi keyword cho Part 4 (Q8-10) và Part 5 (Q11).',
            },
        ],
        deviceCheckLabel: 'Kiểm tra micro & loa',
    },
    writing: {
        label: 'Writing',
        verb: 'viết',
        searchPlaceholder: 'Tìm theo mã đề (ETS WR-05), tiêu đề hoặc tag...',
        roomChecks: [
            {
                icon: LuKeyboard,
                title: 'Bàn phím & bộ gõ tiếng Anh',
                description: 'Tắt bộ gõ Telex/VNI để tránh gõ sai ký tự.',
            },
            {
                icon: LuLockKeyhole,
                title: 'Quy chế thi máy (CBT)',
                description: '8 phút cho Q1-5, 10 phút/email Q6-7, 30 phút Essay Q8. Khóa bài khi hết giờ.',
            },
            {
                icon: LuHardDriveDownload,
                title: 'Tự động lưu bản nháp',
                description: 'Bài viết được lưu trên trình duyệt sau mỗi lần gõ.',
            },
        ],
        deviceCheckLabel: 'Kiểm tra bàn phím',
    },
};
