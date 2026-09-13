import { test, expect } from '@playwright/test';

test('auth screen supports keyboard navigation, French and narrow viewports', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page.getByTestId('locale-en').click();
  await expect(page.getByTestId('email-input')).toBeVisible();
  await page.getByLabel('Email address').focus();
  await page.keyboard.press('Tab');
  await expect(page.getByTestId('password-input')).toBeFocused();
  await page.screenshot({ path: testInfo.outputPath('auth-en-desktop.png'), fullPage: true });
  await page.getByTestId('locale-fr').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByTestId('sign-in-button')).not.toHaveText('Sign in');
  await page.screenshot({ path: testInfo.outputPath('auth-fr-desktop.png'), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId('email-input')).toBeVisible();
  await expect(page.getByTestId('sign-in-button')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('auth-fr-mobile.png'), fullPage: true });
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  expect(errors).toEqual([]);
});
