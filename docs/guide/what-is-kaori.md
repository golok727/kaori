# What is Kaori?

Kaori is a TypeScript library for building reactive user interfaces with familiar syntax from React and Solid.js. It combines the best of both worlds: the simplicity of signals-based reactivity and the power of lit-html for efficient rendering.

## Why Kaori?

### 🎯 Simple Yet Powerful

Kaori's API is intentionally small and focused. You can learn the entire framework in an afternoon, yet it's powerful enough to build complex applications.

### ⚡ Performance First

Built on two battle-tested libraries:
- **lit-html** - Efficient template rendering using native browser features
- **@preact/signals-core** - Fine-grained reactivity that updates only what changed

### 🔄 Familiar Patterns

If you've used React or Solid.js, you'll feel right at home:

```tsx
function Counter() {
  const count = signal(0);
  
  return () => (
    <button onClick={() => count.value++}>
      Count: {count.value}
    </button>
  );
}
```

### 📦 Lightweight

Kaori has a minimal footprint with only essential dependencies. The core library is just a few kilobytes gzipped.

## How It Works

Kaori uses a **compiler-based approach** to transform your JSX into optimized lit-html templates. Here's what happens:

1. **Write Components** - Use JSX with familiar React-like syntax
2. **Compiler Transforms** - JSX is converted to lit-html template literals
3. **Reactive Updates** - Signals track dependencies and trigger precise updates
4. **Efficient Rendering** - lit-html applies minimal DOM changes

## Core Principles

### Separation of Setup and Render

Components in Kaori follow a simple pattern:

```tsx
function Component(props) {
  // Setup phase - runs once
  const state = signal(0);
  
  // Render phase - runs on every update
  return () => <div>{state.value}</div>;
}
```

This separation makes it clear what runs once (setup) and what runs on updates (render).

### Fine-Grained Reactivity

Only the specific parts of your UI that depend on a signal will update when that signal changes. No virtual DOM diffing, no unnecessary re-renders.

### Explicit Over Implicit

Kaori favors explicit, clear patterns over "magic" behavior. You always know what's happening and why.

## When to Use Kaori

Kaori is great for:
- ✅ Building interactive web applications
- ✅ Projects where bundle size matters
- ✅ Teams familiar with React or Solid.js
- ✅ Applications that need fine-grained reactivity

Kaori might not be ideal for:
- ❌ Server-side rendering (not supported yet)
- ❌ Projects requiring a large ecosystem of libraries
- ❌ Static websites with minimal interactivity

## Next Steps

Ready to get started? Check out the [Getting Started](/guide/getting-started) guide!
