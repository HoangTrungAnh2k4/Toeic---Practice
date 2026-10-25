import { LuFileCog, LuHeadset, LuHistory, LuMic, LuShieldCheck, LuUserRound } from 'react-icons/lu';
import { SettingGroup } from './types';

export const SETTING_BASE_PATH = '/setting';

/** Nhóm trang con của /setting, xếp dọc trên một trang. Thêm trang mới chỉ cần bổ sung vào `sections` của nhóm phù hợp. */
export const SETTING_GROUPS: SettingGroup[] = [
    {
        id: 'account',
        title: 'Tài khoản',
        description: 'Thông tin cá nhân, mục tiêu điểm và kết quả các lượt làm bài.',
        Icon: LuUserRound,
        sections: [
            {
                id: 'profile',
                title: 'Hồ sơ cá nhân',
                description:
                    'Xem thông tin tài khoản, thói quen học cùng điểm mục tiêu và lịch thi TOEIC Speaking & Writing.',
                href: `${SETTING_BASE_PATH}/profile`,
                actionLabel: 'Xem hồ sơ',
                Icon: LuUserRound,
            },
            {
                id: 'history',
                title: 'Lịch sử làm bài',
                description:
                    'Xem lại toàn bộ lượt làm bài Speaking, Writing và Thi thử, kèm điểm số và nhận xét chi tiết.',
                href: `${SETTING_BASE_PATH}/history`,
                actionLabel: 'Xem lịch sử',
                Icon: LuHistory,
            },
        ],
    },
    {
        id: 'exam-room',
        title: 'Phòng thi',
        description: 'Chuẩn bị thiết bị trước khi vào phòng thi Speaking.',
        Icon: LuMic,
        sections: [
            {
                id: 'device-check',
                title: 'Kiểm tra thiết bị',
                description: 'Kiểm tra micro, loa và quyền ghi âm của trình duyệt để phòng thi Speaking hoạt động ổn định.',
                href: `${SETTING_BASE_PATH}/device-check`,
                actionLabel: 'Bắt đầu kiểm tra',
                Icon: LuHeadset,
            },
        ],
    },
    {
        id: 'admin',
        title: 'Quản trị',
        description: 'Công cụ quản lý nội dung dành cho quản trị viên.',
        Icon: LuShieldCheck,
        sections: [
            {
                id: 'exam-management',
                title: 'Quản trị đề thi',
                description: 'Quản lý kho đề Speaking & Writing, trạng thái thẩm định và xem trước phòng thi.',
                href: '/exam-management',
                actionLabel: 'Mở trình quản trị',
                Icon: LuFileCog,
            },
        ],
    },
];
