import { pathToFileURL } from 'node:url';
import { createLocalAdmin, getLocalConfig } from './local-config.mjs';

// Public deterministic LOCAL fixtures, never production credentials.
export const localAccounts = [
  { email: 'alice@example.test', password: 'Local-test-password-42!' },
  { email: 'bob@example.test', password: 'Local-test-password-42!' },
];

export async function seedLocalAccounts() {
  const admin = createLocalAdmin(getLocalConfig());
  const { data, error } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) throw error;
  for (const account of localAccounts) {
    const existing = data.users.find((user) => user.email === account.email);
    const result = existing
      ? await admin.auth.admin.updateUserById(existing.id, {
          password: account.password,
          email_confirm: true,
        })
      : await admin.auth.admin.createUser({ ...account, email_confirm: true });
    if (result.error) throw result.error;
  }
  console.log(
    'Local Alice and Bob test accounts are ready. See supabase/README.md for fixture credentials.',
  );
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  seedLocalAccounts().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
