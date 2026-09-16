import { reactRouter } from '@react-router/dev/vite';
import { defineConfig } from 'vite';
import { linguiMacros } from './lingui-plugin.ts';

export default defineConfig({
  plugins: [linguiMacros(), reactRouter()],
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'development'),
  },
  resolve: {
    alias: {
      'react-native': 'react-native-web',
    },
    extensions: [
      '.web.tsx',
      '.web.ts',
      '.web.jsx',
      '.web.js',
      '.mjs',
      '.js',
      '.mts',
      '.ts',
      '.jsx',
      '.tsx',
      '.json',
    ],
  },
  server: { port: 5173, strictPort: true },
});
