import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/** Chỉ các trang công khai; phòng thi, lịch sử, cài đặt đều theo người dùng. */
export default function sitemap(): MetadataRoute.Sitemap {
    return ['', '/speaking', '/writing', '/login', '/register'].map((path) => ({ url: `${SITE_URL}${path}` }));
}
