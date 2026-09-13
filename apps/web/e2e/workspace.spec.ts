import { randomUUID } from 'node:crypto';
import { test, expect } from './fixtures';
import type { Page } from '@playwright/test';

async function signIn(page: Page, account: { email: string; password: string }) {
  await page.getByTestId('email-input').fill(account.email);
  await page.getByTestId('password-input').fill(account.password);
  await page.getByTestId('sign-in-button').click();
  await expect(page.getByTestId('task-input')).toBeVisible();
}

test('real auth, reload, profile, private tasks, languages and account isolation', async ({
  page,
  backend,
}, testInfo) => {
  const [a, b] = backend.accounts;
  await page.goto('/');
  await page.getByTestId('locale-en').click();
  await page.screenshot({ path: testInfo.outputPath('auth-en.png'), fullPage: true });
  await signIn(page, a);
  await expect(page.getByText(backend.privateTitle)).toHaveCount(0);
  const title = `Ship a small improvement ${randomUUID()}`;
  await page.getByTestId('task-input').fill(title);
  await page.getByTestId('add-task-button').click();
  const row = page.getByTestId('task-row').filter({ hasText: title });
  await expect(row).toBeVisible();
  // Controlled checkbox: click then assert — Playwright's check() expects a sync DOM flip.
  await row.getByTestId('task-toggle').click();
  await expect(row.getByTestId('task-toggle')).toBeChecked();
  await page.getByTestId('profile-name-input').fill('Alex Example');
  await page.getByTestId('save-profile-button').click();
  await expect(page.getByRole('status')).toHaveText('Profile saved.');
  await page.reload();
  await expect(page.getByTestId('profile-name-input')).toHaveValue('Alex Example');
  await expect(row.getByTestId('task-toggle')).toBeChecked();
  await page.screenshot({ path: testInfo.outputPath('workspace-en.png'), fullPage: true });
  await page.getByTestId('locale-fr').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByTestId('add-task-button')).not.toHaveText(/Add task/);
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await page.screenshot({ path: testInfo.outputPath('workspace-fr.png'), fullPage: true });
  await page.getByTestId('locale-en').click();
  await page.getByTestId('sign-out-button').click();
  await signIn(page, b);
  await expect(page.getByText(backend.privateTitle)).toBeVisible();
  await expect(page.getByText(title)).toHaveCount(0);
  await expect(page.getByTestId('profile-name-input')).not.toHaveValue('Alex Example');
  await page.getByTestId('sign-out-button').click();
  await signIn(page, a);
  await row.getByTestId('task-delete').click();
  await expect(row).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('task-input')).toBeVisible();
  await expect(page.getByText(title)).toHaveCount(0);
});

test('creates a real account through the sign-up form', async ({ page, backend }) => {
  const email = `web-signup-${randomUUID()}@example.test`;
  let id: string | undefined;
  try {
    await page.goto('/');
    await page.getByTestId('locale-en').click();
    await page.getByTestId('sign-up-button').click();
    await page.getByTestId('email-input').fill(email);
    await page.getByTestId('password-input').fill(`Aa1!${randomUUID()}`);
    await page.getByTestId('sign-up-button').click();
    await expect(page.getByTestId('task-input')).toBeVisible();
    const { data, error } = await backend.admin.auth.admin.listUsers({ perPage: 1000 });
    if (error) throw error;
    id = data.users.find((user) => user.email === email)?.id;
    expect(id).toBeTruthy();
    await page.reload();
    await expect(page.getByTestId('task-input')).toBeVisible();
  } finally {
    if (!id) {
      const { data } = await backend.admin.auth.admin.listUsers({ perPage: 1000 });
      id = data.users.find((user) => user.email === email)?.id;
    }
    if (id) {
      const result = await backend.admin.auth.admin.deleteUser(id);
      expect.soft(result.error, 'Sign-up account cleanup').toBeNull();
    }
  }
});
