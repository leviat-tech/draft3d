import { defineConfig } from 'vitest/config';
import path from 'path';


export default defineConfig({
  build: {
    lib: {
      entry: 'src/index.js', // Your entry file
      formats: ['cjs'],
      fileName: (format) => `draft3d.${format}.js`, // Output file name
    },
    rollupOptions: {
      output: {
        // To ensure the correct output format
        format: 'cjs',
      },
    },
    minify: false,
  },
  test: {
    coverage: {
      provider: 'istanbul',
      reporter: ['html'],
    },
    environment: 'jsdom',
    globals: true,
    include: ['**/*.spec.js'],
    setupFiles: ['./__tests__/utils/setup.js'],
  },
  resolve: {
    alias: {
      '@': `${path.resolve(__dirname, 'src')}`,
    },
  },
});
