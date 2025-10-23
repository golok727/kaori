# Kaori

A Typescript library for building reactive user interfaces with familiar syntax with react, solid.

Kaori is built on top of `lit-html` and `@preact-signals/core` for signals.

Kaori's compiler converts JSX into template literals which are then rendered using `lit-html`.

If you find any bugs or have suggestions, please open an issue or a PR.

Its my playground for now so expect breaking changes.

## 📚 Documentation

Coming soon...

## Installation

```bash
pnpm create kaori awesome-kaori
cd awesome-kaori
pnpm install
pnpm dev
```

## Example

```tsx
import { signal, computed, render } from 'kaori.js';

function App(props: { name: string }) {
  const count = signal(0);
  const double = computed(() => count.value * 2);
  const cond = computed(() => count.value > 3);

  // this part runs only once

  function increment() {
    count.value++;
  }

  return () => (
    // this part runs on every state change
    <div class="h-full flex flex-col gap-4 items-center justify-center">
      <h1 class="text-xl font-bold">Welcome to Kaori ^^</h1>
      <p class="text-lg">Hello {props.name}</p>
      <button class="button-primary" onClick={increment}>
        Click Me!
      </button>
      <p>Count: {count.value}</p>
      <p>Double: {double.value}</p>
      <Show when={cond.value}>Count is greater than 3!</Show>
    </div>
  );
}

render(<App name={'ayana'} />, root);
```

## Docs

- So basically if you access any signal/computed inside the component function, it will trigger a re-render when the signal/computed changes.
- It will only rerun the render function not the whole component function.
- You can use `onMount` to run a function when the component is mounted.
- You can use `effect` to run a function when any signal/computed changes.
- You can use `For` and `Show` for conditional rendering and list rendering.
- You can pass props to components and access them inside the component function.

## Special attributes for elements

- `prop:value={val}` → bind to a node's JavaScript properties using the prop:<propname> namespaced attribute and the property name:(equivalent to `.value=${val}` in Lit).

- `bool:checked={val}` → toggles a boolean attribute (equivalent to `?checked=${val}` in Lit).

- `onClick={val}` → any attribute starting with `on` adds an event listener (equivalent to `@click=${val}` in Lit). Value can be the event listener or an object eith a `handleEvent` method with optional event options. This is equivalent of calling `addEventListener` on the element [Read More](https://lit.dev/docs/v1/lit-html/writing-templates/#add-event-listeners)

```tsx
<button onClick={(ev) => {}}>
<button onClick={{ handleEvent(ev) {}}}>
```

## For Component

In most cases, using loops or `Array.map` is an efficient way to build repeating templates. However, if you want to reorder a large list, or mutate it by adding and removing individual entries, this approach can involve recreating a large number of DOM nodes.
More [here](https://lit.dev/docs/v1/lit-html/writing-templates/#repeating-templates-with-the-repeat-directive)

```tsx
import { For } from 'kaori.js';
function List(props: { items: string[] }) {
  return () => (
    <ul>
      <For items={props.items}>{item => <li>{item}</li>}</For>
    </ul>
  );
}
```

## Show Component

Show lets you conditionally render content without causing the Parent component to rerender unnecessarily. Using if statements or ternary operators directly will trigger a rerender of the App if the condition changes.

Example: Using Show (No App rerender)

```tsx
import { signal } from 'preact/signals';
import { Show } from 'kaori.js';

function App() {
  const count = signal(0);
  const isVisible = signal(true);

  return () => (
    <div>
      <button onClick={() => count.value++}>Increment: {count.value}</button>

      <Show when={isVisible.value} fallback={...}>
        <p>This content updates without rerendering App</p>
      </Show>
    </div>
  );
}
```

Example: Using if or ternary (App rerenders)

```tsx
function App() {
  const count = signal(0);
  const isVisible = signal(true);

  return () => (
    <div>
      <button onClick={() => count.value++}>Increment: {count.value}</button>

      {isVisible.value && <p>This will trigger App rerender!</p>}
    </div>
  );
}
```

- This works because the compiler automatically wraps the Show condition in a getter. The isVisible signal is accessed inside Show, not while rendering the App Component, so updating it does not rerender App Component.

> Tip: Use Show for conditional content if parent doesn’t need to rerender when the condition changes.

## Once render

```tsx
function OnceComponent() {
  return (
    <div>
      <p>This content is rendered only once!</p>
    </div>
  );
}
```

## classMap attribute

`classMap` attribute lets you dynamically apply CSS classes based on a truthy value.

```tsx
function MoodBadge(props: { mood: 'happy' | 'sad' | 'angry' }) {
  return () => (
    <span
      classMap={{
        'bg-yellow-300': props.mood === 'happy',
        'bg-blue-300': props.mood === 'sad',
        'bg-red-300': props.mood === 'angry',
        'text-white': props.mood === 'angry',
      }}
    >
      {props.mood.toUpperCase()} MOOD
    </span>
  );
}
```

### Props

Since Kaori is a reactive framework, props can’t be destructured directly.
However, Kaori provides an elegant and flexible way to work around this limitation using the splitProps helper — making it easy to separate, spread, or forward props to other elements or components.

Using `splitProps` to organize your props

```ts
import { cn } from 'your-library';
import { splitProps } from 'kaori.js';

function Button(initialProps) {
  // `props` will contain { children: ..., class: ... }
  // `rest` will include all remaining props
  const [props, rest] = splitProps(initialProps, ['children', 'class']);

  return () => (
    <button class={cn("your-class", props.class)} {...rest}>
      {props.children}
    </button>
  );
}
```

`splitProps` helps you keep your components clean and expressive — especially when you need to forward props or manage a mix of reactive and static attributes.

## Manually trigger updates

```tsx
import { getHandle } from 'kaori.js';
function Thing() {
  const handle = getHandle(); // only call this inside setup code

  let count = 0;

  function increment() {
    count++;
    handle.update();
  }

  return () => (
    <div>
      <p>Count: {count}!</p>
      <button onClick={increment}>Update</button>
    </div>
  );
}
```

## On Mount

```tsx
import { onMount } from 'kaori.js';
function OnMountComponent() {
  onMount(() => {
    console.log('Component mounted!');
  });
  return () => (
    <div>
      <p>This component logs to console when mounted!</p>
    </div>
  );
}
```

## Effect

```tsx
import { signal, effect } from 'kaori.js';
function EffectComponent() {
  const count = signal(0);

  effect(() => {
    console.log('Count changed:', count.value);
  });

  function increment() {
    count.value++;
  }
  return () => (
    <div>
      <p>Count: {count.value}!</p>
      <button onClick={increment}>Increment</button>
    </div>
  );
}
```

## onCleanup

```tsx
import { onMount } from 'kaori.js';

function CleanupComponent() {
  onMount(() => {
    let interval = setInterval(() => {
      console.log('Interval running');
    }, 1000);
    return () => {
      clearInterval(interval);
      console.log('Interval cleared');
    };
  });

  return () => (
    <div>
      <p>This component sets up an interval and cleans it up on unmount!</p>
    </div>
  );
}
```
