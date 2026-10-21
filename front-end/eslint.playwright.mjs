// Đã gộp vào eslint.config.mjs:
//   import playwrightRules from './eslint.playwright.mjs';
//   defineConfig([...cấu hình hiện có, ...playwrightRules]);
import playwright from 'eslint-plugin-playwright';

const recommended = playwright.configs['flat/recommended'];

const playwrightRules = [
  {
    // `use` của fixture Playwright không phải React hook
    files: ['tests/**/*.ts'],
    rules: { 'react-hooks/rules-of-hooks': 'off' },
  },
  {
    ...recommended,
    // Chỉ áp cho file test. fixtures.ts và auth.setup.ts do người sở hữu.
    files: ['tests/e2e/**/*.spec.ts'],
    linterOptions: {
      // Bỏ qua mọi comment eslint-disable trong test, để agent không tự tắt luật được
      noInlineConfig: true,
      reportUnusedDisableDirectives: 'error',
    },
    rules: {
      ...recommended.rules,
      'playwright/no-skipped-test': 'error',
      'playwright/no-focused-test': 'error',
      'playwright/no-conditional-in-test': 'error',
      'playwright/no-conditional-expect': 'error',
      'playwright/no-force-option': 'error',
      'playwright/no-wait-for-timeout': 'error',
      'playwright/no-wait-for-selector': 'error',
      'playwright/no-networkidle': 'error',
      'playwright/no-page-pause': 'error',
      'playwright/expect-expect': 'error',
      'playwright/valid-expect': 'error',
      'playwright/missing-playwright-await': 'error',
      'playwright/prefer-web-first-assertions': 'error',
      'playwright/no-useless-not': 'error',
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/*', '**/lib/**', '**/app/**', '**/components/**'],
              message: 'Không import code của app vào E2E. Expected value phải lấy từ tests/oracle.',
            },
          ],
        },
      ],
    },
  },
];

export default playwrightRules;
