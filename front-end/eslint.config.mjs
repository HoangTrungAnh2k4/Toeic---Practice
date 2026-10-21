import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import playwrightRules from './eslint.playwright.mjs';

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    ...playwrightRules,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        '.next/**',
        'out/**',
        'build/**',
        'next-env.d.ts',
        // Git worktrees of Claude Code sessions (each has its own .next build)
        '.claude/**',
    ]),
]);

export default eslintConfig;
