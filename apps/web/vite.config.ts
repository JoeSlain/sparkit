import { reactRouter } from '@react-router/dev/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';
import { linguiMacros } from './lingui-plugin';
export default defineConfig({
  plugins: [linguiMacros(), tailwindcss(), reactRouter()],
  server: { port: 5173, strictPort: true },
});
