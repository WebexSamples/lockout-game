// frontend/vitest.config.js

/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.js',

    // ✅ Coverage config
    coverage: {
      reporter: ['text', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: ['src/test/', 'src/**/*.test.{js,jsx}', 'src/mocks/'],
    },
  },
});
