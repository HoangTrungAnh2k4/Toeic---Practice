import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* config options here */
    cacheComponents: true,
    // Speech SDK dùng module Node (ws, https-proxy-agent), chạy thẳng từ node_modules thay vì bundle
    serverExternalPackages: ['microsoft-cognitiveservices-speech-sdk'],
    partialPrefetching: true,
    turbopack: {
        rules: {
            '*.css': {
                loaders: ['@tailwindcss/turbopack'],
                as: '*.css',
            },
        },
    },
    async redirects() {
        return [
            {
                source: '/',
                destination: '/overview',
                permanent: false,
            },
            {
                source: '/history/:path*',
                destination: '/setting/history/:path*',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
