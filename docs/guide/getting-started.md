# Getting Started

Get up and running with Kaori in minutes!

## Prerequisites

Before you begin, make sure you have:
- Node.js 18 or higher
- pnpm, npm, or yarn package manager

## Creating a New Project

The easiest way to start a Kaori project is using `create-kaori`:

::: code-group

```bash [pnpm]
pnpm create kaori my-kaori-app
cd my-kaori-app
pnpm install
pnpm dev
```

```bash [npm]
npm create kaori my-kaori-app
cd my-kaori-app
npm install
npm run dev
```

```bash [yarn]
yarn create kaori my-kaori-app
cd my-kaori-app
yarn install
yarn dev
```

:::

This will scaffold a new Kaori project with:
- Vite for blazing-fast development
- TypeScript configuration
- Kaori compiler setup
- Example components to get you started

## Manual Installation

If you prefer to add Kaori to an existing project:

::: code-group

```bash [pnpm]
pnpm add kaori.js
pnpm add -D kaori-compiler
```

```bash [npm]
npm install kaori.js
npm install --save-dev kaori-compiler
```

```bash [yarn]
yarn add kaori.js
yarn add --dev kaori-compiler
```

:::

### Vite Configuration

Add the Kaori Vite plugin to your `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import { kaoriVitePlugin } from 'kaori-compiler';

export default defineConfig({
  plugins: [kaoriVitePlugin()],
  esbuild: {
    jsx: 'preserve',
  },
});
```

### TypeScript Configuration

Update your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "preserve",
    "jsxImportSource": "kaori.js",
    "types": ["kaori.js/jsx"]
  }
}
```

## Your First Component

Create a file `src/App.tsx`:

```tsx
import { signal, render } from 'kaori.js';

function App() {
  const count = signal(0);
  
  function increment() {
    count.value++;
  }
  
  return () => (
    <div>
      <h1>Hello Kaori!</h1>
      <p>Count: {count.value}</p>
      <button onClick={increment}>
        Increment
      </button>
    </div>
  );
}

const root = document.getElementById('root')!;
render(<App />, root);
```

## Development Server

Start your development server:

```bash
pnpm dev
```

Your app will be running at `http://localhost:5173`

## What's Next?

Now that you have Kaori set up, you can:

- Learn about [Reactivity](/guide/reactivity) in Kaori
- Understand [Components](/guide/components) patterns
- Explore [Props](/guide/props) handling
- Check out [Examples](/examples/basic) for inspiration

## Project Structure

A typical Kaori project looks like this:

```
my-kaori-app/
├── public/
│   └── favicon.ico
├── src/
│   ├── App.tsx          # Root component
│   ├── main.tsx         # Entry point
│   └── style.css        # Global styles
├── index.html           # HTML template
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Editor Setup

For the best development experience, we recommend:

### VS Code

Install these extensions:
- [TypeScript Vue Plugin (Volar)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) - For JSX support
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)

### WebStorm

WebStorm has built-in support for TypeScript and JSX. Just make sure JSX support is enabled in your project settings.

## Troubleshooting

### JSX Not Transforming

Make sure:
1. The Kaori Vite plugin is properly configured
2. Your `tsconfig.json` has `"jsx": "preserve"`
3. Files use `.tsx` extension

### Type Errors

If you see type errors with JSX:
1. Ensure `kaori.js/jsx` is in your `tsconfig.json` types
2. Restart your TypeScript server
3. Check that you're importing from `kaori.js`

### Hot Module Replacement Issues

If HMR isn't working:
1. Make sure you're using Vite 5+
2. Check your Vite configuration
3. Try clearing the `.vite` cache directory

Need more help? Check out our [GitHub Issues](https://github.com/golok727/kaori/issues) or join the community!
