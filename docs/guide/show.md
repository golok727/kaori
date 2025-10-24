# Show Component

The `Show` component conditionally renders content without causing unnecessary parent re-renders.

## Basic Usage

```tsx
import { signal, Show } from 'kaori.js';

function Component() {
  const visible = signal(true);

  return () => (
    <div>
      <Show when={visible.value}>
        <p>I'm visible!</p>
      </Show>
    </div>
  );
}
```

## With Fallback

Render alternative content when condition is false:

```tsx
<Show when={user.value !== null} fallback={() => <div>Please log in</div>}>
  <div>Welcome, {user.value.name}!</div>
</Show>
```

## Why Use Show?

### The Problem with Ternary

Using ternary or `&&` directly causes the parent to re-render:

```tsx
function App() {
  const visible = signal(true);

  // ❌ App re-renders when visible changes
  return () => <div>{visible.value && <p>Content</p>}</div>;
}
```

### Solution with Show

`Show` isolates updates to avoid parent re-renders:

```tsx
function App() {
  const visible = signal(true);

  // ✅ Only Show updates, not App
  return () => (
    <div>
      <Show when={visible.value}>
        <p>Content</p>
      </Show>
    </div>
  );
}
```

## How It Works

The compiler automatically wraps the `when` condition in a getter, so:

```tsx
<Show when={visible.value}>
```

Becomes something like:

```tsx
<Show when={() => visible.value}>
```

This means the signal is accessed inside `Show`, not in the parent component.

## Multiple Conditions

Chain multiple conditions:

```tsx
function Auth() {
  const user = signal(null);
  const loading = signal(true);

  return () => (
    <div>
      <Show
        when={loading.value}
        fallback={() => (
          <Show when={user.value} fallback={() => <Login />}>
            <Dashboard user={user.value} />
          </Show>
        )}
      >
        <Spinner />
      </Show>
    </div>
  );
}
```

## With Data

Pass data to children when condition is met:

```tsx
function UserProfile() {
  const user = signal<User | null>(null);

  onMount(async () => {
    user.value = await fetchUser();
  });

  return () => (
    <Show when={user.value} fallback={() => <div>Loading...</div>}>
      <div>
        <h1>{user.value!.name}</h1>
        <p>{user.value!.email}</p>
      </div>
    </Show>
  );
}
```

## Nested Show

Handle complex conditional rendering:

```tsx
function Content() {
  const auth = signal(false);
  const premium = signal(false);

  return () => (
    <Show when={auth.value} fallback={() => <Login />}>
      <Show when={premium.value} fallback={() => <Upgrade />}>
        <PremiumContent />
      </Show>
    </Show>
  );
}
```

## Performance Benefits

```tsx
function Parent() {
  const count = signal(0);
  const show = signal(true);

  return () => {
    console.log('Parent render'); // Only logs on count change

    return (
      <div>
        <p>Count: {count.value}</p>
        <button onClick={() => count.value++}>+</button>
        <button onClick={() => (show.value = !show.value)}>Toggle</button>

        {/* Show isolates its updates */}
        <Show when={show.value}>
          <ExpensiveComponent />
        </Show>
      </div>
    );
  };
}
```

## When NOT to Use Show

Use regular conditionals when:

1. **The parent already updates anyway**

   ```tsx
   return () => (
     <div>
       {/* Parent updates on count, so no benefit from Show */}
       {count.value > 10 && <p>Big number!</p>}
     </div>
   );
   ```

2. **Simple static conditions**
   ```tsx
   // No signals involved
   return () => <div>{props.showFooter && <Footer />}</div>;
   ```

## Best Practices

### ✅ Do

```tsx
// Use Show to avoid parent re-renders
<Show when={condition.value}>
  <Child />
</Show>

// Provide fallback for better UX
<Show when={data.value} fallback={() => <Loading />}>
  <Content data={data.value} />
</Show>
```

### ❌ Don't

```tsx
// Don't use Show for non-reactive conditions
<Show when={true}>
  <Static />
</Show>

// Don't nest too deeply (use early returns instead)
<Show when={a}>
  <Show when={b}>
    <Show when={c}>
      <Deep />
    </Show>
  </Show>
</Show>
```

## Complete Example

```tsx
import { signal, Show, onMount } from 'kaori.js';

type User = { name: string; role: string };

function Dashboard() {
  const user = signal<User | null>(null);
  const loading = signal(true);
  const error = signal<Error | null>(null);

  onMount(async () => {
    try {
      user.value = await fetchUser();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  });

  return () => (
    <div>
      <Show
        when={loading.value}
        fallback={() => (
          <Show
            when={error.value}
            fallback={() => (
              <Show when={user.value}>
                <div>
                  <h1>Welcome, {user.value!.name}!</h1>
                  <Show when={user.value!.role === 'admin'}>
                    <AdminPanel />
                  </Show>
                </div>
              </Show>
            )}
          >
            <ErrorMessage error={error.value!} />
          </Show>
        )}
      >
        <LoadingSpinner />
      </Show>
    </div>
  );
}
```

## Next Steps

- Learn about [Event Handlers](/guide/events)
- Explore [Property Binding](/guide/property-binding)
- Check out [Examples](/examples/basic)
