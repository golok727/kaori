# Custom Hooks

Create reusable logic with custom hooks.

## useToggle

Toggle boolean state:

```tsx
import { signal } from 'kaori.js';

function useToggle(initial = false) {
  const state = signal(initial);
  
  return {
    get value() { return state.value; },
    toggle: () => state.value = !state.value,
    setTrue: () => state.value = true,
    setFalse: () => state.value = false,
  };
}

// Usage
function Modal() {
  const isOpen = useToggle(false);
  
  return () => (
    <div>
      <button onClick={isOpen.toggle}>Toggle Modal</button>
      <Show when={isOpen.value}>
        <div class="modal">
          <button onClick={isOpen.setFalse}>Close</button>
        </div>
      </Show>
    </div>
  );
}
```

## useCounter

Counter with increment/decrement:

```tsx
import { signal } from 'kaori.js';

function useCounter(initial = 0, step = 1) {
  const count = signal(initial);
  
  return {
    get value() { return count.value; },
    increment: () => count.value += step,
    decrement: () => count.value -= step,
    reset: () => count.value = initial,
    set: (value: number) => count.value = value,
  };
}

// Usage
function Counter() {
  const counter = useCounter(0, 5);
  
  return () => (
    <div>
      <p>Count: {counter.value}</p>
      <button onClick={counter.decrement}>-5</button>
      <button onClick={counter.increment}>+5</button>
      <button onClick={counter.reset}>Reset</button>
    </div>
  );
}
```

## useLocalStorage

Sync state with localStorage:

```tsx
import { signal, effect } from 'kaori.js';

function useLocalStorage<T>(key: string, initial: T) {
  const stored = localStorage.getItem(key);
  const state = signal<T>(
    stored ? JSON.parse(stored) : initial
  );
  
  effect(() => {
    localStorage.setItem(key, JSON.stringify(state.value));
  });
  
  return {
    get value() { return state.value; },
    set value(v: T) { state.value = v; },
  };
}

// Usage
function Settings() {
  const theme = useLocalStorage('theme', 'light');
  
  return () => (
    <div>
      <p>Theme: {theme.value}</p>
      <button onClick={() => theme.value = 'dark'}>
        Set Dark
      </button>
    </div>
  );
}
```

## useAsync

Handle async data fetching:

```tsx
import { signal, onMount } from 'kaori.js';

function useAsync<T>(fetcher: () => Promise<T>, initial?: T) {
  const data = signal<T | null>(initial ?? null);
  const loading = signal(true);
  const error = signal<Error | null>(null);
  
  async function load() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await fetcher();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }
  
  onMount(() => {
    load();
  });
  
  return {
    get data() { return data.value; },
    get loading() { return loading.value; },
    get error() { return error.value; },
    reload: load,
  };
}

// Usage
function UserProfile(props: { userId: string }) {
  const user = useAsync(() => fetchUser(props.userId));
  
  return () => {
    if (user.loading) return <div>Loading...</div>;
    if (user.error) return <div>Error: {user.error.message}</div>;
    return <div>User: {user.data?.name}</div>;
  };
}
```

## useInterval

Set up intervals with cleanup:

```tsx
import { signal, onMount } from 'kaori.js';

function useInterval(callback: () => void, delay: number) {
  onMount(() => {
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  });
}

// Usage
function Clock() {
  const time = signal(new Date());
  
  useInterval(() => {
    time.value = new Date();
  }, 1000);
  
  return () => <div>{time.value.toLocaleTimeString()}</div>;
}
```

## useDebounce

Debounce value changes:

```tsx
import { signal, effect } from 'kaori.js';

function useDebounce<T>(value: T, delay: number) {
  const debounced = signal(value);
  
  effect(() => {
    const timer = setTimeout(() => {
      debounced.value = value;
    }, delay);
    
    return () => clearTimeout(timer);
  });
  
  return debounced;
}

// Usage
function Search() {
  const input = signal('');
  const debouncedInput = useDebounce(input.value, 500);
  
  effect(() => {
    console.log('Searching for:', debouncedInput.value);
    // Perform search
  });
  
  return () => (
    <input
      prop:value={input.value}
      onChange={(e) => input.value = e.target.value}
    />
  );
}
```

## Best Practices

1. **Return getters** for reactive values
2. **Return methods** for actions
3. **Use onMount** for setup with cleanup
4. **Use effect** for reactive side effects
5. **Keep hooks simple** and focused
