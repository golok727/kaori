# Quick Start

Learn the basics of Kaori in 5 minutes!

## Basic Example

Here's a complete example showing Kaori's core concepts:

```tsx
import { signal, computed, render, Show } from 'kaori.js';

function App() {
  // Reactive state
  const count = signal(0);
  const double = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);
  
  // Event handler
  function increment() {
    count.value++;
  }
  
  function decrement() {
    count.value--;
  }
  
  // Render function - runs on every update
  return () => (
    <div>
      <h1>Counter App</h1>
      
      <div>
        <button onClick={decrement}>-</button>
        <span>Count: {count.value}</span>
        <button onClick={increment}>+</button>
      </div>
      
      <p>Double: {double.value}</p>
      
      <Show when={isEven.value} fallback={() => <p>Odd number</p>}>
        <p>Even number!</p>
      </Show>
    </div>
  );
}

// Mount the app
const root = document.getElementById('root')!;
render(<App />, root);
```

## Key Concepts

### 1. Signals - Reactive State

Signals are the foundation of reactivity in Kaori:

```tsx
import { signal } from 'kaori.js';

const count = signal(0);           // Create a signal
console.log(count.value);           // Read: 0
count.value = 5;                    // Write: 5
```

### 2. Computed - Derived State

Computed values automatically update when their dependencies change:

```tsx
import { signal, computed } from 'kaori.js';

const firstName = signal('John');
const lastName = signal('Doe');
const fullName = computed(() => `${firstName.value} ${lastName.value}`);

console.log(fullName.value); // "John Doe"
```

### 3. Components

Components are functions that return a render function:

```tsx
function Greeting(props: { name: string }) {
  // Setup code runs once
  const message = signal('Hello');
  
  // Render function runs on updates
  return () => <h1>{message.value} {props.name}!</h1>;
}
```

### 4. Props

Props are reactive by default. Never destructure them:

```tsx
// ❌ Don't do this
function Bad({ name }) {
  return () => <div>{name}</div>;
}

// ✅ Do this instead
function Good(props: { name: string }) {
  return () => <div>{props.name}</div>;
}
```

### 5. Effects

Run side effects that depend on reactive state:

```tsx
import { signal, effect } from 'kaori.js';

function Logger() {
  const count = signal(0);
  
  effect(() => {
    console.log('Count changed:', count.value);
  });
  
  return () => (
    <button onClick={() => count.value++}>
      Count: {count.value}
    </button>
  );
}
```

### 6. Lifecycle

Use lifecycle hooks for setup and cleanup:

```tsx
import { signal, onMount } from 'kaori.js';

function Timer() {
  const seconds = signal(0);
  
  onMount(() => {
    const interval = setInterval(() => {
      seconds.value++;
    }, 1000);
    
    // Cleanup function
    return () => clearInterval(interval);
  });
  
  return () => <div>Seconds: {seconds.value}</div>;
}
```

## Common Patterns

### Toggle State

```tsx
function Toggle() {
  const isOpen = signal(false);
  
  return () => (
    <div>
      <button onClick={() => isOpen.value = !isOpen.value}>
        Toggle
      </button>
      <Show when={isOpen.value}>
        <p>I'm visible!</p>
      </Show>
    </div>
  );
}
```

### List Rendering

```tsx
import { signal, For } from 'kaori.js';

function TodoList() {
  const todos = signal(['Learn Kaori', 'Build app', 'Deploy']);
  
  return () => (
    <ul>
      <For items={todos.value} key={(item, i) => i}>
        {(item) => <li>{item}</li>}
      </For>
    </ul>
  );
}
```

### Form Handling

```tsx
function Form() {
  const name = signal('');
  const email = signal('');
  
  function handleSubmit(e: Event) {
    e.preventDefault();
    console.log({ name: name.value, email: email.value });
  }
  
  return () => (
    <form onSubmit={handleSubmit}>
      <input 
        type="text"
        prop:value={name.value}
        onChange={(e) => name.value = e.target.value}
      />
      <input 
        type="email"
        prop:value={email.value}
        onChange={(e) => email.value = e.target.value}
      />
      <button type="submit">Submit</button>
    </form>
  );
}
```

### Custom Hooks

```tsx
function useCounter(initial = 0) {
  const count = signal(initial);
  
  return {
    get value() { return count.value; },
    increment: () => count.value++,
    decrement: () => count.value--,
    reset: () => count.value = initial,
  };
}

function Counter() {
  const counter = useCounter(10);
  
  return () => (
    <div>
      <p>Count: {counter.value}</p>
      <button onClick={counter.increment}>+</button>
      <button onClick={counter.decrement}>-</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
}
```

## Next Steps

You now know the basics! Here's what to explore next:

- [Reactivity](/guide/reactivity) - Deep dive into signals and computed
- [Components](/guide/components) - Advanced component patterns
- [Control Flow](/guide/for) - For and Show components
- [API Reference](/api/core) - Complete API documentation

## Cheat Sheet

```tsx
// Reactivity
const state = signal(value);        // Create signal
const derived = computed(() => {}); // Computed value
effect(() => {});                   // Side effect

// Lifecycle
onMount(() => {});                  // On mount
onCleanup(() => {});                // On cleanup

// Components
<For items={list}>{item => ...}</For>
<Show when={condition}>...</Show>

// Special Attributes
prop:value={val}      // Property binding
bool:checked={val}    // Boolean attribute
onClick={handler}     // Event listener
classMap={{}}         // Class map
styleMap={{}}         // Style map

// Refs
const ref = createRef();
<div ref={ref}></div>

// Helpers
splitProps(props, ['a', 'b'])  // Split props
mergeProps(a, b)                // Merge props
```

Happy coding with Kaori!
