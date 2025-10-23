# Components

Components are the building blocks of Kaori applications. They're functions that encapsulate logic and return UI templates.

## Component Basics

### Function Components

Every Kaori component is a function:

```tsx
function Greeting() {
  return () => <h1>Hello Kaori!</h1>;
}
```

### Reactive Components

Return a function to make your component reactive:

```tsx
import { signal } from 'kaori.js';

function Counter() {
  const count = signal(0);
  
  // This function runs on every update
  return () => (
    <button onClick={() => count.value++}>
      Count: {count.value}
    </button>
  );
}
```

### Static Components

Return JSX directly for static content:

```tsx
function Logo() {
  // Renders once, never updates
  return <img src="/logo.svg" alt="Logo" />;
}
```

## Component Lifecycle

### Setup Phase

Code in the component body runs once:

```tsx
function Component() {
  // ✅ Setup phase - runs once
  const state = signal(0);
  const handle = getHandle();
  
  console.log('Setting up component');
  
  // Return render function
  return () => <div>{state.value}</div>;
}
```

### Render Phase

The returned function runs on updates:

```tsx
function Component() {
  const count = signal(0);
  
  return () => {
    // ✅ Runs on every update
    console.log('Rendering with count:', count.value);
    return <div>{count.value}</div>;
  };
}
```

## Props

Props are passed as the first argument:

### Basic Props

```tsx
type GreetingProps = {
  name: string;
  age?: number;
};

function Greeting(props: GreetingProps) {
  return () => (
    <div>
      <h1>Hello {props.name}!</h1>
      {props.age && <p>Age: {props.age}</p>}
    </div>
  );
}

// Usage
<Greeting name="Kaori" age={25} />
```

### Props are Reactive

Props are reactive by default. Never destructure them!

```tsx
// ❌ DON'T destructure props
function Bad({ name, age }) {
  return () => <div>{name}</div>;
}

// ✅ DO access props directly
function Good(props: { name: string; age: number }) {
  return () => <div>{props.name}</div>;
}
```

### Children

Children are passed via props:

```tsx
type CardProps = {
  children: JSX.Element;
  title?: string;
};

function Card(props: CardProps) {
  return () => (
    <div class="card">
      {props.title && <h2>{props.title}</h2>}
      <div class="content">{props.children}</div>
    </div>
  );
}

// Usage
<Card title="My Card">
  <p>Card content here</p>
</Card>
```

## Composition

### Component Composition

Build complex UIs from simple components:

```tsx
function Avatar(props: { src: string; name: string }) {
  return () => (
    <img src={props.src} alt={props.name} class="avatar" />
  );
}

function UserCard(props: { user: User }) {
  return () => (
    <div class="user-card">
      <Avatar src={props.user.avatar} name={props.user.name} />
      <h3>{props.user.name}</h3>
      <p>{props.user.bio}</p>
    </div>
  );
}
```

### Render Props

Pass render functions as props:

```tsx
type ContainerProps = {
  children: (data: string) => JSX.Element;
};

function DataContainer(props: ContainerProps) {
  const data = signal('Loading...');
  
  onMount(async () => {
    data.value = await fetchData();
  });
  
  return () => props.children(data.value);
}

// Usage
<DataContainer>
  {(data) => <div>{data}</div>}
</DataContainer>
```

## Component Patterns

### Container/Presenter Pattern

Separate logic from presentation:

```tsx
// Container - handles logic
function CounterContainer() {
  const count = signal(0);
  const increment = () => count.value++;
  const decrement = () => count.value--;
  
  return () => (
    <CounterView 
      count={count.value}
      onIncrement={increment}
      onDecrement={decrement}
    />
  );
}

// Presenter - pure presentation
function CounterView(props: {
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}) {
  return () => (
    <div>
      <button onClick={props.onDecrement}>-</button>
      <span>{props.count}</span>
      <button onClick={props.onIncrement}>+</button>
    </div>
  );
}
```

### Higher-Order Components

Create components that enhance other components:

```tsx
function withLogging<P extends object>(
  Component: (props: P) => () => JSX.Element
) {
  return (props: P) => {
    onMount(() => {
      console.log('Component mounted with props:', props);
    });
    
    return Component(props);
  };
}

const LoggedCounter = withLogging(Counter);
```

### Provider Pattern

Share state across components:

```tsx
// Create a context-like provider
function createProvider<T>(initialValue: T) {
  const state = signal(initialValue);
  
  return {
    Provider: (props: { children: JSX.Element }) => {
      return () => props.children;
    },
    useValue: () => state,
  };
}

const ThemeProvider = createProvider({ mode: 'light' });

function App() {
  return () => (
    <ThemeProvider.Provider>
      <ThemedComponent />
    </ThemeProvider.Provider>
  );
}

function ThemedComponent() {
  const theme = ThemeProvider.useValue();
  return () => <div class={theme.value.mode}>Themed!</div>;
}
```

## Component Communication

### Parent to Child

Pass props down:

```tsx
function Parent() {
  const message = signal('Hello');
  
  return () => <Child message={message.value} />;
}

function Child(props: { message: string }) {
  return () => <div>{props.message}</div>;
}
```

### Child to Parent

Use callback props:

```tsx
function Parent() {
  const handleClick = (value: string) => {
    console.log('Child clicked:', value);
  };
  
  return () => <Child onClick={handleClick} />;
}

function Child(props: { onClick: (value: string) => void }) {
  return () => (
    <button onClick={() => props.onClick('data')}>
      Click me
    </button>
  );
}
```

### Sibling Communication

Use shared state:

```tsx
function Parent() {
  const shared = signal(0);
  
  return () => (
    <div>
      <SiblingA value={shared} />
      <SiblingB value={shared} />
    </div>
  );
}
```

## Error Boundaries

Handle errors in components:

```tsx
function ErrorBoundary(props: { 
  children: JSX.Element;
  fallback: (error: Error) => JSX.Element;
}) {
  const error = signal<Error | null>(null);
  
  try {
    return () => error.value 
      ? props.fallback(error.value)
      : props.children;
  } catch (e) {
    error.value = e as Error;
    return () => props.fallback(e as Error);
  }
}

// Usage
<ErrorBoundary fallback={(error) => <div>Error: {error.message}</div>}>
  <App />
</ErrorBoundary>
```

## Async Components

Handle async data loading:

```tsx
function AsyncComponent() {
  const data = signal<Data | null>(null);
  const loading = signal(true);
  const error = signal<Error | null>(null);
  
  onMount(async () => {
    try {
      data.value = await fetchData();
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  });
  
  return () => {
    if (loading.value) return <div>Loading...</div>;
    if (error.value) return <div>Error: {error.value.message}</div>;
    return <div>Data: {JSON.stringify(data.value)}</div>;
  };
}
```

## Memoization

Optimize expensive computations:

```tsx
import { computed } from 'kaori.js';

function ExpensiveComponent(props: { data: any[] }) {
  // Memoize expensive calculation
  const processed = computed(() => {
    console.log('Processing data...');
    return props.data.map(item => expensiveTransform(item));
  });
  
  return () => (
    <div>
      <For items={processed.value}>
        {item => <div>{item}</div>}
      </For>
    </div>
  );
}
```

## Component Testing

Test components by mounting and interacting:

```tsx
import { signal, render } from 'kaori.js';

function Counter() {
  const count = signal(0);
  return () => (
    <button onClick={() => count.value++}>
      {count.value}
    </button>
  );
}

// Test
const container = document.createElement('div');
render(<Counter />, container);
const button = container.querySelector('button')!;
button.click();
expect(button.textContent).toBe('1');
```

## Best Practices

### ✅ Do

- Keep components small and focused
- Use TypeScript for type safety
- Separate logic from presentation
- Use computed for derived values
- Handle cleanup in lifecycle hooks

### ❌ Don't

- Don't create signals in render phase
- Don't destructure props
- Don't mutate props
- Don't use side effects in render
- Don't forget to clean up resources

## Next Steps

- Learn about [Props](/guide/props) in detail
- Understand [Lifecycle](/guide/lifecycle) hooks
- Explore [Control Flow](/guide/for) components
- Check out [Examples](/examples/basic)
