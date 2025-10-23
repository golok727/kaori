# Boolean Attributes

Use `bool:` prefix for boolean HTML attributes like `disabled`, `checked`, `selected`, etc.

## Basic Usage

```tsx
function Checkbox() {
  const checked = signal(false);
  
  return () => (
    <input 
      type="checkbox"
      bool:checked={checked.value}
      onChange={() => checked.value = !checked.value}
    />
  );
}
```

## Common Boolean Attributes

```tsx
function Examples() {
  const disabled = signal(false);
  const checked = signal(true);
  const readonly = signal(false);
  const required = signal(true);
  
  return () => (
    <div>
      <button bool:disabled={disabled.value}>Button</button>
      <input bool:checked={checked.value} type="checkbox" />
      <input bool:readonly={readonly.value} />
      <input bool:required={required.value} />
      <video bool:controls={true} bool:autoplay={false} />
      <details bool:open={true}>
        <summary>Details</summary>
      </details>
    </div>
  );
}
```

## Why bool:?

Boolean attributes work differently than regular attributes:

```tsx
// ❌ Wrong - attribute="false" is still truthy in HTML
<button disabled={false}>Button</button>

// ✅ Correct - removes attribute when false
<button bool:disabled={false}>Button</button>
```

## Dynamic Toggle

```tsx
function ToggleButton() {
  const disabled = signal(false);
  
  return () => (
    <div>
      <button onClick={() => disabled.value = !disabled.value}>
        Toggle
      </button>
      <button bool:disabled={disabled.value}>
        Action Button
      </button>
    </div>
  );
}
```

## List of Boolean Attributes

- `disabled`
- `checked`
- `selected`
- `readonly`
- `required`
- `multiple`
- `hidden`
- `controls`
- `autoplay`
- `muted`
- `loop`
- `open`
- `async`
- `defer`
