import { randomUUID } from 'node:crypto';
import { test as base, expect } from '@playwright/test';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@sparkit/supabase';

type Account = { id: string; email: string; password: string };
type Backend = {
  accounts: [Account, Account];
  privateTitle: string;
  admin: SupabaseClient<Database>;
};
export const test = base.extend<{ backend: Backend }>({
  backend: async ({ baseURL }, use) => {
    if (!baseURL) throw new Error('Playwright baseURL must identify the running web app.');
    const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key || !serviceKey)
      throw new Error(
        'Real E2E requires local SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY and SUPABASE_SERVICE_ROLE_KEY. See apps/web/README.md.',
      );
    const hostname = new URL(url).hostname;
    if (!['127.0.0.1', 'localhost', '[::1]'].includes(hostname))
      throw new Error('E2E fixtures only provision accounts in a local Supabase project.');
    const admin = createClient<Database>(url, serviceKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const accounts: Account[] = [];
    try {
      for (let i = 0; i < 2; i++) {
        const email = `web-e2e-${randomUUID()}@example.test`;
        const password = `Aa1!${randomUUID()}`;
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
        if (error || !data.user) throw error ?? new Error('Missing fixture user');
        accounts.push({ id: data.user.id, email, password });
      }
      const privateTitle = `Private B ${randomUUID()}`;
      const userB = createClient<Database>(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const signedIn = await userB.auth.signInWithPassword(accounts[1]!);
      if (signedIn.error) throw signedIn.error;
      const seeded = await userB
        .from('tasks')
        .insert({ user_id: accounts[1]!.id, title: privateTitle });
      if (seeded.error) throw seeded.error;
      await userB.auth.signOut();
      await use({ accounts: accounts as [Account, Account], privateTitle, admin });
    } finally {
      for (const account of accounts) {
        const result = await admin.auth.admin.deleteUser(account.id);
        expect.soft(result.error, 'Fixture account cleanup').toBeNull();
      }
    }
  },
});
export { expect };
