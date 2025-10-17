import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { kaori } from 'kaori-compiler/vite';

export default defineConfig({
  plugins: [kaori(), tailwindcss()],
});
