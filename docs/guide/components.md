# Components

Components are the building blocks of Kaori applications. They're functions that encapsulate logic and return UI templates.

## Component Basics

### Function Components

Every Kaori component is a function:

```tsx
function Greeting() {
  return () => <h1>Hello Kaori! ✨</h1>;
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

Read more about them [here](/guide/props)


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
