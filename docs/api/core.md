# Core API

Core functions for rendering and component management.

## render

Mounts a component to a DOM element.

```tsx
import { render } from 'kaori.js';

function App() {
  return () => <div>Hello Kaori!</div>;
}

const root = document.getElementById('root')!;
render(<App />, root);
```

### Type Signature

```ts
function render(
  component: JSX.Element,
  container: HTMLElement | DocumentFragment
): void
```

## getHandle

Gets a handle to the current component for manual updates.

```tsx
import { getHandle } from 'kaori.js';

function Component() {
  const handle = getHandle();
  let count = 0;

  function increment() {
    count++;
    handle.update(); // Manually trigger re-render
  }

  return () => <button onClick={increment}>{count}</button>;
}
```

### Type Signature

```ts
function getHandle(): ComponentHandle

interface ComponentHandle {
  update(): void;
}
```

::: warning
`getHandle()` must be called during component setup, not in render or effects.
:::

## html

Tagged template for raw HTML (from lit-html).

```tsx
import { html } from 'kaori.js';

function Component() {
  return () => html`
    <div>
      <p>Raw HTML content</p>
    </div>
  `;
}
```

### Type Signature

```ts
function html(
  strings: TemplateStringsArray,
  ...values: unknown[]
): TemplateResult
```

## nothing

Represents no content to render.

```tsx
import { nothing } from 'kaori.js';

function Conditional(props: { show: boolean }) {
  return () => props.show ? <div>Content</div> : nothing;
}
```

### Type Signature

```ts
const nothing: symbol
```

## component

Internal directive for components (used by compiler).

```tsx
// You typically don't use this directly
// The compiler transforms JSX to use this

// JSX:
<MyComponent prop="value" />

// Becomes something like:
component(MyComponent, { prop: "value" })
```

### Type Signature

```ts
function component<Props>(
  Component: (props: Props) => unknown,
  props: Props
): unknown
```


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
````

## ref
ref directive use ref without compiler
> you dont need to use this if you are using the compiler

```tsx
import  createRef, ref, html } from 'kaori.js';

const myRef = createRef();

html`<div ${ref(myRef)}>Content</div>`
```

### Type Signature

```ts
const ref: Directive
```
