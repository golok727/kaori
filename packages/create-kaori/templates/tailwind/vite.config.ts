import { defineConfig } from 'vite';
import { kaori } from 'kaori-compiler/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [kaori(), tailwindcss()],
});
