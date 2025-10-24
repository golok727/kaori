# Lifecycle

Lifecycle hooks let you run code at specific points in a component's life.

## onMount

Run code when a component is mounted:

```tsx
import { signal, onMount } from 'kaori.js';

function Component() {
  const data = signal(null);

  onMount(() => {
    console.log('Component mounted!');
    data.value = fetchData();
  });

  return () => <div>{data.value}</div>;
}
```

## Cleanup with onMount

Return a cleanup function from `onMount`:

```tsx
import { onMount } from 'kaori.js';

function Timer() {
  const count = signal(0);

  onMount(() => {
    const interval = setInterval(() => {
      count.value++;
    }, 1000);

    // Cleanup - called when component unmounts
    return () => {
      clearInterval(interval);
      console.log('Timer cleaned up');
    };
  });

  return () => <div>Time: {count.value}s</div>;
}
```

## onCleanup

Alternative way to register cleanup:

```tsx
import { onMount, onCleanup } from 'kaori.js';

function Component() {
  let subscription;

  onMount(() => {
    subscription = subscribe();
  });

  onCleanup(() => {
    subscription.unsubscribe();
  });

  return () => <div>Subscribed</div>;
}
```

## effect

Run side effects that depend on signals:

```tsx
import { signal, effect } from 'kaori.js';

function Logger() {
  const count = signal(0);

  effect(() => {
    console.log('Count changed to:', count.value);
    document.title = `Count: ${count.value}`;
  });

  return () => <button onClick={() => count.value++}>Increment</button>;
}
```

## Lifecycle Order

1. Component function runs (setup)
2. `onMount` callbacks queued
3. Render function runs (first render)
4. `onMount` callbacks execute
5. On updates, render function runs
6. On unmount, cleanup functions run

## Common Patterns

### Data Fetching

```tsx
function UserProfile(props: { userId: string }) {
  const user = signal(null);
  const loading = signal(true);

  onMount(async () => {
    loading.value = true;
    user.value = await fetchUser(props.userId);
    loading.value = false;
  });

  return () =>
    loading.value ? <div>Loading...</div> : <div>{user.value.name}</div>;
}
```

### Event Listeners

```tsx
function ClickTracker() {
  const clicks = signal(0);

  onMount(() => {
    const handleClick = () => clicks.value++;
    window.addEventListener('click', handleClick);

    return () => window.removeEventListener('click', handleClick);
  });

  return () => <div>Global clicks: {clicks.value}</div>;
}
```

### Timers and Intervals

```tsx
function Countdown(props: { seconds: number }) {
  const remaining = signal(props.seconds);

  onMount(() => {
    const interval = setInterval(() => {
      if (remaining.value > 0) {
        remaining.value--;
      }
    }, 1000);

    return () => clearInterval(interval);
  });

  return () => <div>{remaining.value}s remaining</div>;
}
```

## Next Steps

- Explore [For Component](/guide/for)
- Learn about [Show Component](/guide/show)
- Check out [Examples](/examples/basic)
