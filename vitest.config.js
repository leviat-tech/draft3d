import { defineConfig } from 'vitest/config';
import path from 'path';


export default defineConfig({
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html'],
    },
    watch: false, // Set to false for husky
    environment: 'jsdom',
  },
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
});
