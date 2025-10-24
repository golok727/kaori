# Basic Counter

A simple counter demonstrating signals and event handling.

## Code

```tsx
import { signal, render } from 'kaori.js';

function Counter() {
  const count = signal(0);

  function increment() {
    count.value++;
  }

  function decrement() {
    count.value--;
  }

  function reset() {
    count.value = 0;
  }

  return () => (
    <div class="counter">
      <h1>Counter: {count.value}</h1>
      <div class="buttons">
        <button onClick={decrement}>-</button>
        <button onClick={reset}>Reset</button>
        <button onClick={increment}>+</button>
      </div>
    </div>
  );
}

const root = document.getElementById('root')!;
render(<Counter />, root);
```

## With Computed

Add derived state:

```tsx
import { signal, computed, render } from 'kaori.js';

function Counter() {
  const count = signal(0);
  const double = computed(() => count.value * 2);
  const isEven = computed(() => count.value % 2 === 0);

  return () => (
    <div>
      <h1>Count: {count.value}</h1>
      <p>Double: {double.value}</p>
      <p>Is even: {isEven.value ? 'Yes' : 'No'}</p>
      <button onClick={() => count.value++}>Increment</button>
    </div>
  );
}
```

## With Conditional Rendering

```tsx
import { signal, computed, Show } from 'kaori.js';

function Counter() {
  const count = signal(0);
  const isBig = computed(() => count.value > 10);

  return () => (
    <div>
      <h1>Count: {count.value}</h1>
      <button onClick={() => count.value++}>+</button>

      <Show when={isBig.value}>
        <p class="alert">Count is getting big! 🎉</p>
      </Show>
    </div>
  );
}
```

## Styling

```css
.counter {
  text-align: center;
  padding: 2rem;
}

.counter h1 {
  font-size: 3rem;
  margin: 1rem 0;
  color: #ff6b9d;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.buttons button {
  padding: 0.75rem 2rem;
  font-size: 1.25rem;
  border: 2px solid #ff6b9d;
  border-radius: 8px;
  background: white;
  color: #ff6b9d;
  cursor: pointer;
  transition: all 0.2s;
}

.buttons button:hover {
  background: #ff6b9d;
  color: white;
  transform: translateY(-2px);
}
```
