import type { IconType } from 'react-icons';
import { LuGithub, LuLinkedin, LuMail } from 'react-icons/lu';

/**
 * Dữ liệu hiển thị ở footer toàn cục.
 * Số đề đọc từ Supabase ở `site-footer.tsx`. Link cá nhân và link `#` vẫn là mock, chờ thông tin thật.
 */

export type SocialLink = { label: string; href: string; icon: IconType };

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

export const linkGroups: FooterLinkGroup[] = [
    {
        title: 'Hỗ trợ',
        links: [
            { label: 'Hướng dẫn làm bài', href: '#' },
            { label: 'Kiểm tra micro và loa', href: '/setting/device-check' },
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
