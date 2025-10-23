# Class & Style Maps

Kaori provides `classMap` and `styleMap` for dynamic class and style management.

## classMap

Apply CSS classes conditionally:

```tsx
import { signal } from 'kaori.js';

function Button() {
  const isActive = signal(false);
  const isDisabled = signal(false);

  return () => (
    <button
      classMap={{
        'btn': true,                    // Always applied
        'btn-active': isActive.value,   // Conditional
        'btn-disabled': isDisabled.value
      }}
      onClick={() => isActive.value = !isActive.value}
    >
      Click me
    </button>
  );
}
```

## styleMap

Apply inline styles dynamically:

```tsx
import { signal } from 'kaori.js';

function ColorBox() {
  const color = signal('#ff69b4');
  const size = signal(100);

  return () => (
    <div
      style={{
        backgroundColor: color.value,
        width: `${size.value}px`,
        height: `${size.value}px`,
        borderRadius: '8px'
      }}
    />
  );
}
```

## Combining with Regular Classes

```tsx
function Component() {
  const active = signal(false);

  return () => (
    <button
      class="btn btn-primary"
      classMap={{
        'active': active.value
      }}
    >
      Button
    </button>
  );
}
```

## Dynamic Styles Example

```tsx
function ProgressBar(props: { progress: number }) {
  return () => (
    <div class="progress-container">
      <div
        class="progress-bar"
        style={{
          width: `${props.progress}%`,
          backgroundColor: props.progress === 100 ? 'green' : 'blue'
        }}
      />
    </div>
  );
}
```

## Theme Example

```tsx
function ThemedComponent() {
  const theme = signal<'light' | 'dark'>('light');

  return () => (
    <div
      classMap={{
        'theme-light': theme.value === 'light',
        'theme-dark': theme.value === 'dark'
      }}
      style={{
        backgroundColor: theme.value === 'light' ? '#fff' : '#000',
        color: theme.value === 'light' ? '#000' : '#fff'
      }}
    >
      <button onClick={() => theme.value = theme.value === 'light' ? 'dark' : 'light'}>
        Toggle Theme
      </button>
    </div>
  );
}
```

## Best Practices

```tsx
// ✅ Use classMap for conditional classes
classMap={{ 'active': isActive.value }}

// ✅ Use style for dynamic values
style={{ width: `${width.value}px` }}

// ❌ Dont use `class` and `className` together (in future we will support both)
<div class="base" classMap={{ 'modified': condition }} style={{ ... }}>
// do this indtead
<div classMap={{ 'base': true, 'modified': condition }} style={{ ... }}>
```
