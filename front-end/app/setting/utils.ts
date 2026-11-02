import { LuHistory, LuUserRound } from 'react-icons/lu';
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
    // Tạm ẩn nhóm "Phòng thi" (Kiểm tra thiết bị); route /setting/device-check vẫn còn
];
