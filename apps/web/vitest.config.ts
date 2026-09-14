import { defineConfig } from 'vitest/config';
import { linguiMacros } from './lingui-plugin.ts';

export default defineConfig({
  plugins: [linguiMacros()],
  oxc: { jsx: { runtime: 'automatic' } },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
