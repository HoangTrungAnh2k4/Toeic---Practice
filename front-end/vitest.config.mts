import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: { tsconfigPaths: true },
    // tests/ là E2E của Playwright (*.spec.ts), Vitest không chạy được
    test: { exclude: [...configDefaults.exclude, 'tests/**'] },
});
