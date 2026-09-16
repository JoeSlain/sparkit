import { defineConfig } from 'vitest/config';
import { linguiMacros } from './lingui-plugin.ts';

export default defineConfig({
  plugins: [linguiMacros()],
  oxc: { jsx: { runtime: 'automatic' } },
  define: {
    __DEV__: JSON.stringify(true),
    'process.env.NODE_ENV': JSON.stringify('test'),
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
});
