# Helpers API

Utility functions for props and elements.

## splitProps

Splits props object into picked and omitted parts.

```tsx
import { splitProps } from 'kaori.js';

function Button(allProps: ButtonProps & HTMLAttributes) {
  const [props, rest] = splitProps(allProps, ['children', 'class']);
  
  return () => (
    <button class={`btn ${props.class}`} {...rest}>
      {props.children}
    </button>
  );
}
```

### Type Signature

```ts
function splitProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: readonly K[]
): [Pick<T, K>, Omit<T, K>]
```

### Parameters

- `props` - Props object to split
- `keys` - Array of keys to pick

### Returns

Tuple of `[picked, omitted]` objects

## mergeProps

Merges multiple props objects while preserving reactivity.

```tsx
import { mergeProps } from 'kaori.js';

function Component(userProps: Props) {
  const defaults = { color: 'blue', size: 'medium' };
  const props = mergeProps(defaults, userProps);
  
  return () => <div style={{ color: props.color }}>{props.size}</div>;
}
```

### Type Signature

```ts
function mergeProps(...props: any[]): any
```

### Parameters

- `...props` - Props objects to merge (right overwrites left)

### Returns

Merged props object

## spread

Spreads props onto an element (used by compiler).

```tsx
// Typically used via spread syntax
function Component(props: any) {
  return () => <div {...props}>Content</div>;
}
```

### Type Signature

```ts
function spread(props: Record<string, any>): Directive
```

::: tip
You typically don't call `spread` directly. Use JSX spread syntax `{...props}` instead.
:::

## createRef

Creates a ref to access DOM elements.

```tsx
import { createRef } from 'kaori.js';

function Component() {
  const divRef = createRef<HTMLDivElement>();
  
  onMount(() => {
    console.log(divRef.value); // Access DOM element
  });
  
  return () => <div ref={divRef}>Content</div>;
}
```

### Type Signature

```ts
function createRef<T = Element>(): Ref<T>

interface Ref<T = Element> {
  value?: T;
}
```

## ref

Ref directive (used with createRef).

```tsx
import { createRef, ref } from 'kaori.js';

const myRef = createRef();

<div ref={myRef}>Content</div>
```

### Type Signature

```ts
const ref: Directive
```
