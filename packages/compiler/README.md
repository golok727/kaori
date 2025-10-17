# Compiler for Kaori

This package contains the compiler for Kaori framework. It transforms JSX syntax into lit-html template literals.

This package also contains a vite plugin for seamless integration with Vite.

## Installation

```bash
pnpm add -D @kaori/compiler
```

## Usage with vite

```ts
import { defineConfig } from 'vite';
import { kaori } from '@kaori/compiler';
export default defineConfig({
  plugins: [kaori()],
});
```
