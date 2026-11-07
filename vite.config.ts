import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  // Relative URLs support GitHub Pages repository paths and local previews.
  base: './',
  build: {
    rollupOptions: {
      input: {
        arena: fileURLToPath(new URL('./projetos/arena/index.html', import.meta.url)),
        play: fileURLToPath(new URL('./play/index.html', import.meta.url)),
        dots: fileURLToPath(new URL('./projetos/dots/index.html', import.meta.url)),
        puzzle: fileURLToPath(new URL('./projetos/quebra-cabeca/index.html', import.meta.url)),
        company: fileURLToPath(new URL('./index.html', import.meta.url)),
        retroBlocks: fileURLToPath(new URL('./projetos/retro-blocks/index.html', import.meta.url)),
        memoria: fileURLToPath(new URL('./projetos/memoria/index.html', import.meta.url)),
        astera: fileURLToPath(new URL('./projetos/astera/index.html', import.meta.url)),
      },
    },
  },
});
