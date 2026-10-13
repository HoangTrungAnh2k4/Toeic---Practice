import { LuFileCog, LuHeadset, LuHistory, LuUserRound } from 'react-icons/lu';
import { SettingSection } from './types';

export const SETTING_BASE_PATH = '/setting';

/** Danh mục trang con của /setting. Thêm trang mới chỉ cần bổ sung một phần tử vào mảng này. */
export const SETTING_SECTIONS: SettingSection[] = [
    {
        id: 'profile',
        title: 'Hồ sơ cá nhân',
        description: 'Xem thông tin tài khoản, thói quen học cùng điểm mục tiêu và lịch thi TOEIC Speaking & Writing.',
        href: `${SETTING_BASE_PATH}/profile`,
        actionLabel: 'Xem hồ sơ',
        Icon: LuUserRound,
    },
    {
        id: 'device-check',
        title: 'Kiểm tra thiết bị',
        description: 'Kiểm tra micro, loa và quyền ghi âm của trình duyệt để phòng thi Speaking hoạt động ổn định.',
        href: `${SETTING_BASE_PATH}/device-check`,
        actionLabel: 'Bắt đầu kiểm tra',
        Icon: LuHeadset,
    },
    {
        id: 'exam-management',
        title: 'Quản trị đề thi',
        description: 'Bóc tách đề từ Study4 bằng AI, biên tập từng Part và quản lý kho đề Speaking & Writing.',
        href: `${SETTING_BASE_PATH}/exam-management`,
        actionLabel: 'Mở trình quản trị',
        Icon: LuFileCog,
    },
    {
        id: 'history',
        title: 'Lịch sử làm bài',
        description: 'Xem lại toàn bộ lượt làm bài Speaking, Writing và Thi thử, kèm điểm số và nhận xét chi tiết.',
        href: `${SETTING_BASE_PATH}/history`,
        actionLabel: 'Xem lịch sử',
        Icon: LuHistory,
    },
];
