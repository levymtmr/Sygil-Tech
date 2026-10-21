import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Relative URLs support GitHub Pages repository paths and local previews.
  base: './',
  build: {
    rollupOptions: {
      input: {
        company: fileURLToPath(new URL('./index.html', import.meta.url)),
        astera: fileURLToPath(new URL('./projetos/astera/index.html', import.meta.url)),
      },
    },
  },
});
