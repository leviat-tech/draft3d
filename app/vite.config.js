import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import svgLoader from 'vite-svg-loader';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), svgLoader()],
  optimizeDeps: {
    exclude: ['path', 'fs', 'electron-window-state'],
  },
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
      'draft3d': `${path.resolve(__dirname, '../src')}`
    },
  },
  // eliminate the need to explicitly import stylesheets in vue components
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import '@/assets/styles/variables.scss';`,
      },
    },
  },
});
