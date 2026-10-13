import { LuCalendarClock, LuCalendarDays, LuFlame, LuMic, LuPenLine, LuTimer } from 'react-icons/lu';
import { EXAM_GOAL, SKILL_PROGRESS } from '@/app/schedule/utils';
import { CurrentUser, ProfileField } from './types';

/**
 * Người dùng đang đăng nhập, dùng chung cho sidebar và trang hồ sơ.
 * TODO: thay bằng session thật khi có hệ thống đăng nhập.
 */
export const CURRENT_USER: CurrentUser = {
    name: 'Nguyễn Minh Thư',
    initials: 'MT',
    email: 'minhthu@example.com',
    role: 'Học viên',
    joinedAt: '02/03/2026',
};

const SKILL_ICON = { speaking: LuMic, writing: LuPenLine };

/** Thói quen học, hiển thị trong thẻ thông tin cá nhân. */
export const STUDY_FIELDS: ProfileField[] = [
    { id: 'joined', label: 'Ngày tham gia', value: CURRENT_USER.joinedAt, Icon: LuCalendarDays },
    { id: 'streak', label: 'Chuỗi ngày học', value: `${EXAM_GOAL.streakDays} ngày`, Icon: LuFlame },
    {
        id: 'plan',
        label: 'Lịch học',
        value: `${EXAM_GOAL.minutesPerDay} phút/ngày`,
        hint: `${EXAM_GOAL.daysPerWeek} ngày/tuần`,
        Icon: LuTimer,
    },
];

/** Điểm mục tiêu & lịch thi, lấy từ lộ trình ở trang Schedule. */
export const GOAL_FIELDS: ProfileField[] = [
    ...SKILL_PROGRESS.map(({ skill, label, target, targetLevel, current }) => ({
        id: skill,
        label: `Mục tiêu ${label}`,
        value: `${target} điểm`,
        hint: `${targetLevel} · Hiện tại ${current}`,
        Icon: SKILL_ICON[skill],
    })),
    {
        id: 'exam-date',
        label: 'Ngày thi dự kiến',
        value: EXAM_GOAL.examDate,
        hint: `Còn ${EXAM_GOAL.daysLeft} ngày`,
        Icon: LuCalendarClock,
    },
];
