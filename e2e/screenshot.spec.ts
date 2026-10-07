import { test } from '@playwright/test';
import fs from 'node:fs';

test('capture README screenshot', async ({ page, isMobile }) => {
  test.skip(Boolean(isMobile), 'Desktop screenshot only');

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/?c=USD&r=Engineering:5:110,Design:2:85,Product:2:95');

  await page.getByTestId('start-btn').click();
  await page.waitForTimeout(3000);

  fs.mkdirSync('docs', { recursive: true });
  await page.screenshot({ path: 'docs/screenshot.png', fullPage: true });
});
