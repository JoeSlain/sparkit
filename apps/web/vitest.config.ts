import { defineConfig } from 'vitest/config';
import { linguiMacros } from './lingui-plugin';
export default defineConfig({
  plugins: [linguiMacros()],
  esbuild: { jsx: 'automatic' },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
