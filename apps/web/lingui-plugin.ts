import { transformAsync } from '@babel/core';
import type { Plugin } from 'vite';

/** Expand Lingui macros before Vite strips TypeScript and transforms JSX. */
export function linguiMacros(): Plugin {
  return {
    name: 'agency-lingui-macros',
    enforce: 'pre',
    async transform(code, id) {
      if (!/\.[cm]?[jt]sx?$/.test(id) || !code.includes('/macro')) return;
      const result = await transformAsync(code, {
        filename: id,
        configFile: false,
        babelrc: false,
        sourceMaps: true,
        parserOpts: { plugins: ['typescript', 'jsx'] },
        plugins: ['@lingui/babel-plugin-lingui-macro'],
      });
      return result?.code ? { code: result.code, map: result.map } : undefined;
    },
  };
}
