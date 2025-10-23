# Reactivity

Kaori's reactivity system is built on signals from `@preact/signals-core`. This provides automatic updates without manual update calls.

## Signals

Signals are the foundation of reactivity. They're containers for values that notify subscribers when they change.

### Creating Signals

```tsx
import { signal } from 'kaori.js';

const count = signal(0);
const name = signal('Kaori');
const user = signal({ name: 'John', age: 25 });
```

### Reading Signals

Access the current value with `.value`:

```tsx
const count = signal(10);
console.log(count.value); // 10
```

### Writing Signals

Update the value by assigning to `.value`:

```tsx
const count = signal(0);
count.value = 5;        // Set new value
count.value++;          // Increment
count.value += 10;      // Add
```

### Peek Without Subscribing

Use `.peek()` to read without creating a dependency:

```tsx
const count = signal(0);

effect(() => {
  // This will NOT re-run when count changes
  console.log(count.peek());
});
```

## Computed Values

Computed values derive from other reactive sources and update automatically.

### Creating Computed

```tsx
import { signal, computed } from 'kaori.js';

const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"

firstName.value = 'Jane';
console.log(fullName.value); // "Jane Doe"
```

### Computed are Read-Only

You cannot assign to computed values:

```tsx
const double = computed(() => count.value * 2);
// double.value = 10; // ❌ Error!
```

### Computed are Lazy

Computed values only recalculate when accessed:

```tsx
const expensive = computed(() => {
  console.log('Computing...');
  return heavyCalculation();
});

// Nothing logged yet
expensive.value; // "Computing..." logged
expensive.value; // Nothing logged (cached)
```

## Effects

Effects run side effects in response to reactive changes.

### Basic Effects

```tsx
import { signal, effect } from 'kaori.js';

const count = signal(0);

effect(() => {
  console.log('Count is:', count.value);
});
// Logs: "Count is: 0"

count.value = 5;
// Logs: "Count is: 5"
```

### Effect Cleanup

Effects can return a cleanup function:

```tsx
effect(() => {
  const timer = setTimeout(() => {
    console.log('Timer!', count.value);
  }, 1000);

  return () => clearTimeout(timer);
});
```

### Component Effects

In components, use the `effect` export from kaori.js:

```tsx
import { signal, effect } from 'kaori.js';

function Component() {
  const count = signal(0);

  effect(() => {
    document.title = `Count: ${count.value}`;
  });

  return () => <button onClick={() => count.value++}>+</button>;
}
```

## Batching Updates

Batch multiple updates to prevent unnecessary re-renders:

```tsx
import { signal, batch } from 'kaori.js';

const firstName = signal('John');
const lastName = signal('Doe');

// Without batching - triggers 2 updates
firstName.value = 'Jane';
lastName.value = 'Smith';

// With batching - triggers 1 update
batch(() => {
  firstName.value = 'Jane';
  lastName.value = 'Smith';
});
```

## Untracked Reads

Read signals without creating dependencies:

```tsx
import { signal, computed, untracked } from 'kaori.js';

const a = signal(1);
const b = signal(2);

const sum = computed(() => {
  // Changes to 'b' won't trigger re-computation
  return a.value + untracked(() => b.value);
});
```

## Reactivity in Components

### Automatic Reactivity

When you access signals in the render function, Kaori automatically tracks them:

```tsx
function Counter() {
  const count = signal(0);

  // ✅ Automatically reactive
  return () => <div>{count.value}</div>;
}
```

### Setup vs Render Phase

Components have two phases:

```tsx
function Component(props) {
  // SETUP PHASE - Runs once
  const state = signal(0);
  const derived = computed(() => state.value * 2);

  // Effects and lifecycle hooks here
  effect(() => {
    console.log('State:', state.value);
  });

  // RENDER PHASE - Runs on updates
  return () => (
    <div>
      {state.value} × 2 = {derived.value}
    </div>
  );
}
```

### Why Return a Function?

Returning a function tells Kaori "this component is reactive":

```tsx
// ✅ Reactive - re-renders when count changes
function Reactive() {
  const count = signal(0);
  return () => <div>{count.value}</div>;
}

// ❌ Not reactive - renders once
function Static() {
  return <div>Static content</div>;
}
```

## Manual Updates

Sometimes you need to trigger updates without signals:

```tsx
import { getHandle } from 'kaori.js';

function Manual() {
  const handle = getHandle();
  let count = 0; // Not a signal!

  function increment() {
    count++;
    handle.update(); // Manually trigger render
  }

  return () => (
    <button onClick={increment}>
      Count: {count}
    </button>
  );
}
```

::: warning
Use signals instead of manual updates whenever possible. Manual updates are an escape hatch for special cases.
:::

## Reactivity Best Practices

### ✅ Do

```tsx
// Read signals in render
function Good() {
  const count = signal(0);
  return () => <div>{count.value}</div>;
}

// Use computed for derived state
const doubled = computed(() => count.value * 2);

// Use effects for side effects
effect(() => {
  localStorage.setItem('count', count.value.toString());
});
```

### ❌ Don't

```tsx
// Don't read signals in setup without effects
function Bad() {
  const count = signal(0);
  const doubled = count.value * 2; // ❌ Not reactive!
  return () => <div>{doubled}</div>;
}

// Don't create signals in render
function Bad2() {
  return () => {
    const count = signal(0); // ❌ New signal every render!
    return <div>{count.value}</div>;
  };
}

// Don't use signals for local UI state that doesn't need to persist
function Bad3() {
  const hover = signal(false); // ❌ Use local state instead
  return () => <div onMouseEnter={() => hover.value = true}>...</div>;
}
```

## Advanced Patterns

### Conditional Dependencies

```tsx
const enabled = signal(true);
const value = signal(0);

const result = computed(() => {
  if (!enabled.value) {
    return null;
  }
  return value.value * 2; // Only depends on 'value' when enabled
});
```

### Derived Signals

```tsx
function createDerivedSignal<T>(source: Signal<T>, transform: (value: T) => T) {
  const derived = signal(transform(source.value));

  effect(() => {
    derived.value = transform(source.value);
  });

  return derived;
}

const count = signal(5);
const doubled = createDerivedSignal(count, x => x * 2);
```

### Signal as Event Emitter

```tsx
const events = signal<{ type: string; data: any } | null>(null);

// Emit event
events.value = { type: 'click', data: { x: 10, y: 20 } };

// Listen to events
effect(() => {
  const event = events.value;
  if (event?.type === 'click') {
    console.log('Clicked at:', event.data);
  }
});
```

## Performance Tips

1. **Use computed for expensive calculations**
   ```tsx
   const expensive = computed(() => heavyCalculation(data.value));
   ```

2. **Batch related updates**
   ```tsx
   batch(() => {
     signal1.value = a;
     signal2.value = b;
   });
   ```

3. **Use peek() to avoid dependencies**
   ```tsx
   const current = count.peek(); // Won't track
   ```

4. **Memoize static data**
   ```tsx
   const config = { /* large object */ };
   const data = signal(config); // Share reference
   ```

## Debugging Reactivity

### Tracking Dependencies

```tsx
effect(() => {
  console.log('Dependencies:', {
    count: count.value,
    name: name.value
  });
});
```

### Finding Reactive Leaks

```tsx
// Check what's triggering updates
let renderCount = 0;
return () => {
  console.log('Render', ++renderCount);
  return <div>...</div>;
};
```

## Next Steps

- Learn about [Components](/guide/components) patterns
- Explore [Lifecycle](/guide/lifecycle) hooks
- Check out [API Reference](/api/reactivity) for complete details
