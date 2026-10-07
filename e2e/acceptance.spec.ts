import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Meeting Cost Clock @acceptance', () => {
  test.beforeEach(async ({ page }) => {
    // Fail tests on console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        throw new Error(`Console error detected: ${msg.text()}`);
      }
    });
  });

  test('attendees grouped by role with count and hourly rate @acceptance', async ({ page }) => {
    await page.goto('/');

    // Check default attendees
    const attendeesEl = page.getByTestId('total-attendees');
    await expect(attendeesEl).toHaveText('7');

    const hourlyBurnEl = page.getByTestId('total-hourly-rate');
    // 4*95 + 2*80 + 1*90 = 380 + 160 + 90 = 630
    await expect(hourlyBurnEl).toHaveText('$ 630/hr');

    // Add a new role
    const addRoleBtn = page.getByRole('button', { name: '+ Add Role Group' });
    await addRoleBtn.click();

    // Verify 8 attendees now
    await expect(attendeesEl).toHaveText('8');

    // Edit headcount for Engineering (from 4 to 6)
    const engCountInput = page.getByLabel('Attendee count for Engineering');
    await engCountInput.fill('6');
    await expect(attendeesEl).toHaveText('10');
  });

  test('currency picker switches USD, EUR, GBP, INR, BDT with symbols @acceptance', async ({ page }) => {
    await page.goto('/');

    // Test EUR
    await page.getByRole('button', { name: '€ EUR' }).click();
    await expect(page.getByTestId('cost-board')).toContainText('€');
    await expect(page.getByTestId('total-hourly-rate')).toContainText('€');

    // Test GBP
    await page.getByRole('button', { name: '£ GBP' }).click();
    await expect(page.getByTestId('cost-board')).toContainText('£');

    // Test INR
    await page.getByRole('button', { name: '₹ INR' }).click();
    await expect(page.getByTestId('cost-board')).toContainText('₹');

    // Test BDT
    await page.getByRole('button', { name: '৳ BDT' }).click();
    await expect(page.getByTestId('cost-board')).toContainText('৳');

    // Back to USD
    await page.getByRole('button', { name: '$ USD' }).click();
    await expect(page.getByTestId('cost-board')).toContainText('$');
  });

  test('start, pause, and reset controls work as expected @acceptance', async ({ page }) => {
    await page.goto('/');

    const startBtn = page.getByTestId('start-btn');
    const pauseBtn = page.getByTestId('pause-btn');
    const resetBtn = page.getByTestId('reset-btn');
    const statusLabel = page.getByTestId('clock-status-label');

    await expect(statusLabel).toHaveText('Standby');
    await expect(resetBtn).toBeDisabled();

    // Start clock
    await startBtn.click();
    await expect(statusLabel).toHaveText('Ticking Live');

    // Wait for clock to accrue time
    await page.waitForTimeout(1200);

    // Pause clock
    await pauseBtn.click();
    await expect(statusLabel).toHaveText('Paused');
    await expect(resetBtn).toBeEnabled();

    // Reset clock
    await resetBtn.click();
    await expect(statusLabel).toHaveText('Standby');
    await expect(page.getByTestId('timer-display')).toHaveText('00:00:00');
  });

  test('cost ticks smoothly and elapsed time is displayed @acceptance', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('start-btn').click();

    // Wait 1.5s for time and cost to increment
    await page.waitForTimeout(1500);

    // Elapsed time should have progressed past 00:00:00
    const timerDisplay = page.getByTestId('timer-display');
    const timerText = await timerDisplay.innerText();
    expect(timerText).not.toBe('00:00:00');

    // Pause clock
    await page.getByTestId('pause-btn').click();
  });

  test('whole setup lives in the URL and reloads accurately @acceptance', async ({ page }) => {
    // Open with custom setup in query string
    await page.goto('/?c=EUR&r=Directors:3:150,Architects:2:120');

    // Check currency is EUR
    await expect(page.getByTestId('cost-board')).toContainText('€');

    // Check attendee count: 3 + 2 = 5
    await expect(page.getByTestId('total-attendees')).toHaveText('5');

    // Hourly burn: 3*150 + 2*120 = 450 + 240 = 690
    await expect(page.getByTestId('total-hourly-rate')).toHaveText('€ 690/hr');

    // Test share button
    const shareBtn = page.getByTestId('share-btn');
    await shareBtn.click();
    await expect(page.getByTestId('share-feedback')).toBeVisible();
  });

  test('fun comparisons update as clock runs @acceptance', async ({ page }) => {
    // Start with high burn rate to immediately observe comparison numbers
    await page.goto('/?c=USD&r=Execs:10:500'); // $5000/hr = ~$1.38/second

    await page.getByTestId('start-btn').click();
    await page.waitForTimeout(4000); // ~$5.50+ accrued -> at least 1 coffee

    await page.getByTestId('pause-btn').click();

    const coffeeCount = page.getByTestId('comparison-count-coffee');
    const coffeeText = await coffeeCount.innerText();
    const countVal = parseFloat(coffeeText);
    expect(countVal).toBeGreaterThan(0.5);
  });

  test('accessibility check with axe @acceptance', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousOrCritical = accessibilityScanResults.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical'
    );

    expect(seriousOrCritical).toEqual([]);
  });
});
