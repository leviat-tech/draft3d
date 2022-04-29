import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';

export default defineConfig({
  server: {
    open: false,
    port: process.env.PORT || 3333,
  },
  plugins: [vue(), svgLoader()],
  optimizeDeps: {
    exclude: ['path', 'fs', 'electron-window-state'],
  },
});
