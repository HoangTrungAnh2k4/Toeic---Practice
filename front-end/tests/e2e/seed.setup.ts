import { test } from '@playwright/test';
import { seed } from './seed';

test('seed dữ liệu E2E', async () => {
    test.setTimeout(120_000);
    await seed();
});
