import { defineConfig } from 'vite';
import { kaori } from 'kaori-compiler/vite';

export default defineConfig({
  plugins: [kaori()],
});
