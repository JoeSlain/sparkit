import { formatter } from '@lingui/format-po';
import { defineConfig } from '@lingui/conf';

export default defineConfig({
  sourceLocale: 'en',
  locales: ['en', 'fr'],
  catalogs: [
    {
      path: '<rootDir>/packages/i18n/locales/{locale}/messages',
      include: ['<rootDir>/apps', '<rootDir>/packages'],
      exclude: [
        '**/node_modules/**',
        '**/locales/**',
        '**/build/**',
        '**/dist/**',
        '**/ios/**',
        '**/android/**',
        '**/*.test.*',
      ],
    },
  ],
  format: formatter(),
});
