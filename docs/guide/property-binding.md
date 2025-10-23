# Property Binding

Use `prop:` prefix to bind directly to DOM element properties instead of attributes.

## Basic Usage

```tsx
function Input() {
  const value = signal('');
  
  return () => (
    <input 
      prop:value={value.value}
      onChange={(e) => value.value = e.target.value}
    />
  );
}
```

## Why prop:?

Attributes vs Properties:
- **Attributes** - Set on HTML elements, appear in markup
- **Properties** - Set on JavaScript DOM objects

```tsx
// Attribute (string)
<input value="text" />

// Property (can be any type)
<input prop:value={value.value} />
```

## Common Use Cases

### Form Elements

```tsx
function Form() {
  const text = signal('');
  const checked = signal(false);
  
  return () => (
    <form>
      <input prop:value={text.value} />
      <textarea prop:value={text.value} />
      <input type="checkbox" prop:checked={checked.value} />
    </form>
  );
}
```

### Custom Properties

```tsx
<video prop:currentTime={seekTime.value} />
<select prop:selectedIndex={index.value} />
<input prop:selectionStart={cursor.value} />
```

## Benefits

1. **Type Safety** - Properties have defined types
2. **Performance** - Direct property access
3. **Flexibility** - Can set any JavaScript value
4. **Correctness** - Some properties don't have attributes

## Example

```tsx
import { signal } from 'kaori.js';

function VideoPlayer() {
  const time = signal(0);
  const playing = signal(false);
  
  return () => (
    <div>
      <video 
        prop:currentTime={time.value}
        prop:muted={true}
      />
      <input 
        type="range"
        prop:value={time.value}
        onChange={(e) => time.value = e.target.value}
      />
    </div>
  );
}
```
