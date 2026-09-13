import { defineConfig } from 'drizzle-kit';
// No credentials: generation is a pure diff between checked-in schema snapshots.
// Supabase CLI is the ONLY runner. Do not add drizzle-kit migrate/push scripts.
export default defineConfig({
  schema: './src/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  migrations: { prefix: 'supabase' },
  strict: true,
});
