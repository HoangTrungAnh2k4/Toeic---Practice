import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Import/biến thừa chặn ở CI thay vì để thành warning bị lờ đi
    { rules: { '@typescript-eslint/no-unused-vars': 'error' } },
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Git worktrees of Claude Code sessions (each has its own .next build)
        '.claude/**',
        // Báo cáo/trace do Playwright sinh ra (JS minified)
        'playwright-report/**',
        'test-results/**',
    ]),
]);

export default eslintConfig;
