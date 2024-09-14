import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setupFiles/window-matchMedia.ts'],
    include: ['test/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
  },
  esbuild: {
    target: 'es2017',
  },
});
