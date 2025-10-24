# Context

Context provides a way to pass data through the component tree without having to pass props down manually at every level. It uses an efficient linked-list based parent chain for tree traversal.

## Why Context?

Without context, you'd need to pass props through every level:

```tsx
function App() {
  const theme = signal('dark');

  return () => (
    <Layout theme={theme.value}>
      <Header theme={theme.value}>
        <Logo theme={theme.value} />
      </Header>
    </Layout>
  );
}
```

With context, data flows automatically:

```tsx
function App() {
  const handle = getHandle();
  const theme = signal('dark');

  handle.provide(ThemeContext, theme);

  return () => (
    <Layout>
      <Header>
        <Logo /> {/* Accesses theme via context */}
      </Header>
    </Layout>
  );
}

function Logo() {
  const theme = useContext(ThemeContext);
  return () => <img src={`logo-${theme.value}.png`} alt="Logo" />;
}
```

## Basic Usage

### 1. Create a Context

Use `createContext()` with a default value:

```tsx
import { createContext } from 'kaori.js';

const ThemeContext = createContext('light');
```

The default value is returned when no provider exists up the tree.

### 2. Provide Values

Use `handle.provide()` in a parent component:

```tsx
import { getHandle, signal } from 'kaori.js';

function App() {
  const handle = getHandle();
  const theme = signal('dark');

  // Provide the signal directly
  handle.provide(ThemeContext, theme);

  return () => (
    <div>
      <button onClick={() => theme.value = theme.value === 'dark' ? 'light' : 'dark'}>
        Toggle Theme
      </button>
      <Content />
    </div>
  );
}

function Content() {
  const theme = useContext(ThemeContext);

  return () => (
    <div className={`theme-${theme.value}`}>
      Current theme: {theme.value}
    </div>
  );
}
```

### 3. Consume Values

Use `useContext()` in any descendant component:

```tsx
import { useContext } from 'kaori.js';

function Content() {
  const theme = useContext(ThemeContext);

  return () => (
    <div className={`theme-${theme.value}`}>
      Current theme: {theme.value}
    </div>
  );
}
```

## Complete Example

Here's a full theme provider example:

```tsx
import {
  component,
  signal,
  createContext,
  useContext,
  getHandle
} from 'kaori.js';

// 1. Create context
const ThemeContext = createContext(null);

// 2. Parent provides context
function App() {
  const handle = getHandle();

  const theme = signal({
    mode: 'dark',
    color: '#0066cc'
  });

  // Provide the signal directly - only once!
  handle.provide(ThemeContext, theme);

  const toggleMode = () => {
    theme.value = {
      ...theme.value,
      mode: theme.value.mode === 'dark' ? 'light' : 'dark'
    };
  };

  return () => (
    <div style={{ backgroundColor: theme.value.mode === 'dark' ? '#222' : '#fff' }}>
      <button onClick={toggleMode}>Toggle Theme</button>
      <Header />
      <Content />
    </div>
  );
}

// 3. Children consume context (at any depth!)
function Header() {
  return () => (
    <header>
      <Logo />
    </header>
  );
}

function Logo() {
  const theme = useContext(ThemeContext);

  return () => (
    <img src={`/logo-${theme.value.mode}.svg`} alt="Logo" />
  );
}

function Content() {
  const theme = useContext(ThemeContext);

  return () => (
    <main style={{ color: theme.value.mode === 'dark' ? '#fff' : '#000' }}>
      <p>Current theme: {theme.value.mode}</p>
    </main>
  );
}
```

## Multiple Contexts

A component can provide and consume multiple contexts:

```tsx
const ThemeContext = createContext('light');
const UserContext = createContext(null);
const LocaleContext = createContext('en');

function App() {
  const handle = getHandle();

  const theme = signal('dark');
  const user = signal({ name: 'Alice', role: 'admin' });
  const locale = signal('fr');

  handle.provide(ThemeContext, theme);
  handle.provide(UserContext, user);
  handle.provide(LocaleContext, locale);

  return () => <Dashboard />;
}

function Dashboard() {
  const theme = useContext(ThemeContext);
  const user = useContext(UserContext);
  const locale = useContext(LocaleContext);

  return () => (
    <div className={`theme-${theme.value}`}>
      <p>{user.value.name} ({locale.value})</p>
    </div>
  );
}
```

## Reactive Context Updates

Context works seamlessly with signals for reactive updates:

```tsx
function Provider() {
  const handle = getHandle();
  const count = signal(0);

  // Provide signal once - it's automatically reactive!
  handle.provide(CountContext, count);

  return () => (
    <div>
      <button onClick={() => count.value++}>
        Increment
      </button>
      <Consumer />
    </div>
  );
}

function Consumer() {
  const count = useContext(CountContext);

  return () => (
    <div>Count: {count.value}</div>
  );
}
```

## Custom Context Hooks

Create reusable context patterns:

```tsx
const AuthContext = createContext(null);

function useAuth() {
  const auth = useContext(AuthContext);
  if (!auth) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return auth;
}

// Usage in components
function ProtectedRoute() {
  const auth = useAuth(); // Throws if no provider

  return () => (
    <div>Hello {auth.value.user.name}</div>
  );
}
```

## Context with Computed Values

Derive context from other contexts:

```tsx
function StyleProvider() {
  const handle = getHandle();
  const theme = useContext(ThemeContext);
  const locale = useContext(LocaleContext);

  const styles = computed(() => ({
    ...getThemeStyles(theme.value),
    direction: locale.value === 'ar' ? 'rtl' : 'ltr'
  }));

  handle.provide(StyleContext, styles);

  return () => <Layout />;
}
```

## TypeScript Support

Context is fully type-safe:

```tsx
type Theme = {
  mode: 'light' | 'dark';
  color: string;
  fontSize: number;
};

const ThemeContext = createContext<Theme>({
  mode: 'light',
  color: '#000000',
  fontSize: 16
});

function Component() {
  const theme = useContext(ThemeContext); // Type: Signal<Theme>

  return () => (
    <div style={{
      color: theme.value.color,
      fontSize: `${theme.value.fontSize}px`
    }}>
      Theme: {theme.value.mode}
    </div>
  );
}
```

## Best Practices

### ✅ Do

```tsx
// Create contexts outside components
const ThemeContext = createContext();

// Provide signals directly - they're automatically reactive
function Component() {
  const handle = getHandle();
  const theme = signal('dark');
  handle.provide(ThemeContext, theme); // ✅ Once is enough

  return () => <div>...</div>;
}

// Call useContext during component setup
function Component() {
  const theme = useContext(ThemeContext); // ✅ Setup phase
  return () => <div>...</div>;
}

// Provide meaningful default values
const UserContext = createContext({ name: 'Guest', isLoggedIn: false });
```

### ❌ Don't

```tsx
// Don't call useContext in render
function Bad() {
  return () => {
    const theme = useContext(ThemeContext); // ❌ Wrong phase
    return <div>{theme.value}</div>;
  };
}

// Don't create contexts inside components
function Bad2() {
  const MyContext = createContext(null); // ❌ Creates new context each time
  return () => <div>...</div>;
}

// Don't provide context values in effects
function Bad3() {
  const handle = getHandle();
  const data = signal({ count: 0 });

  effect(() => {
    handle.provide(DataContext, data.value); // ❌ Wrong! Provide signal directly
  });
}

// Don't provide primitive values when using signals
function Bad4() {
  const handle = getHandle();
  const theme = signal('dark');

  handle.provide(ThemeContext, theme.value); // ❌ Provide signal, not value
  // Correct: handle.provide(ThemeContext, theme);
}
```




## Next Steps

- Learn about [Lifecycle](/guide/lifecycle) hooks
- Explore [Components](/guide/components) patterns
