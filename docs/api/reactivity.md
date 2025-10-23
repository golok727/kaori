# Reactivity API

Functions for reactive state management (from @preact/signals-core).

## signal

Creates a reactive signal.

```tsx
import { signal } from 'kaori.js';

const count = signal(0);
console.log(count.value);  // Read: 0
count.value = 5;           // Write: 5
console.log(count.peek()); // Read without subscribing: 5
```

### Type Signature

```ts
function signal<T>(initialValue: T): Signal<T>

interface Signal<T> {
  value: T;
  peek(): T;
}
```

## computed

Creates a computed value derived from other signals.

```tsx
import { signal, computed } from 'kaori.js';

const count = signal(10);
const double = computed(() => count.value * 2);

console.log(double.value); // 20
count.value = 15;
console.log(double.value); // 30
```

### Type Signature

```ts
function computed<T>(compute: () => T): Computed<T>

interface Computed<T> {
  readonly value: T;
  peek(): T;
}
```

## effect

Runs a side effect when dependencies change.

```tsx
import { signal, effect } from 'kaori.js';

function Component() {
  const count = signal(0);
  
  effect(() => {
    console.log('Count:', count.value);
    document.title = `Count: ${count.value}`;
  });
  
  return () => <button onClick={() => count.value++}>+</button>;
}
```

### Type Signature

```ts
function effect(fn: () => void): void
```

## batch

Batches multiple signal updates into a single update.

```tsx
import { signal, batch } from 'kaori.js';

const firstName = signal('John');
const lastName = signal('Doe');

batch(() => {
  firstName.value = 'Jane';
  lastName.value = 'Smith';
}); // Only triggers one update
```

### Type Signature

```ts
function batch(fn: () => void): void
```

## untracked

Reads signals without creating dependencies.

```tsx
import { signal, computed, untracked } from 'kaori.js';

const a = signal(1);
const b = signal(2);

const sum = computed(() => {
  return a.value + untracked(() => b.value);
}); // Only depends on 'a', not 'b'
```

### Type Signature

```ts
function untracked<T>(fn: () => T): T
```

## syncEffect

Direct effect from @preact/signals-core (runs synchronously).

```tsx
import { signal, syncEffect } from 'kaori.js';

const count = signal(0);

const dispose = syncEffect(() => {
  console.log('Count:', count.value);
});

// Later: cleanup
dispose();
```

### Type Signature

```ts
function syncEffect(fn: () => void): () => void
```

::: tip
In components, use `effect` from kaori.js instead. It integrates with component lifecycle.
:::
