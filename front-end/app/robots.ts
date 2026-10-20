import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            // Trang theo người dùng, phòng thi và API: không có nội dung công khai để index
            disallow: ['/api/', '/setting/', '/speaking/test', '/writing/test', '/verify-email', '/reset-password'],
        },
        sitemap: `${SITE_URL}/sitemap.xml`,
    };
}
