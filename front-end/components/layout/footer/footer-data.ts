import type { IconType } from 'react-icons';
import { LuGithub, LuLinkedin, LuMail } from 'react-icons/lu';

/**
 * Dữ liệu hiển thị ở footer toàn cục.
 * Hiện đang là dữ liệu mock — thay bằng thông tin thật (link cá nhân, số đề) khi có.
 */

export type SocialLink = { label: string; href: string; icon: IconType };

export type ExamSource = { name: string; note: string; count: string };

export type FooterLinkGroup = { title: string; links: { label: string; href: string }[] };

export const author = {
    name: 'Hoàng Trung Anh',
    initials: 'TA',
    role: 'Thiết kế và phát triển Toeco',
    links: [
        { label: 'GitHub của Hoàng Trung Anh', href: 'https://github.com/', icon: LuGithub },
        { label: 'LinkedIn của Hoàng Trung Anh', href: 'https://www.linkedin.com/', icon: LuLinkedin },
        { label: 'Gửi email cho Hoàng Trung Anh', href: 'mailto:hello@example.com', icon: LuMail },
    ] satisfies SocialLink[],
};

export const examSources: ExamSource[] = [
    { name: 'ETS TOEIC SW Official Test Prep', note: 'Sách luyện thi chính thức', count: '4 đề' },
    { name: 'Đề mẫu trên ets.org', note: 'Bản công khai của ETS', count: '2 đề' },
    { name: 'Toeco biên soạn', note: 'Bám sát format đề thi 2026', count: '18 đề' },
    { name: 'Cộng đồng đóng góp', note: 'Đã qua kiểm duyệt', count: '236 câu' },
];

export const linkGroups: FooterLinkGroup[] = [
    {
        title: 'Hỗ trợ',
        links: [
            { label: 'Hướng dẫn làm bài', href: '#' },
            { label: 'Kiểm tra micro và loa', href: '#' },
            { label: 'Báo lỗi đề thi', href: '#' },
            { label: 'Góp ý tính năng', href: '#' },
        ],
    },
    {
        title: 'Chính sách',
        links: [
            { label: 'Điều khoản sử dụng', href: '#' },
            { label: 'Quyền riêng tư', href: '#' },
            { label: 'Cách xử lý bản ghi âm', href: '#' },
        ],
    },
];

export const copyrightYear = 2026;
