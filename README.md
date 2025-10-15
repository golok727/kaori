# Kaori

A Typescript library for building reactive user interfaces with familiar syntax with react, solid.

Kaori is built on top of `lit-html` and `@preact-signals/core` for signals. 

Kaori's compiler converts JSX into template literals which are then rendered using `lit-html`.

This looks simple but this is very powerful and allows to do a lot of stuff with it.

This is the framework I always wanted to build.

This was made in an afternoon so expect bugs and rough edges.

If you find any bugs or have suggestions, please open an issue or a PR.

Its my playground for now so expect breaking changes.

## Installation

```bash
pnpm create kaori-app awesome-kaori
cd awesome-kaori
pnpm install
pnpm dev
```

## Example

```tsx
import { signal, computed, render } from "kaori.js";

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

render(<App name={"ayana"} />, root);
```

## Docs

Coming soon.. It's my birthday today and its 2:47 AM now so i want to sleep :3

- So basically if you access any signal/computed inside the component function, it will trigger a re-render when the signal/computed changes.
- It will only rerun the render function not the whole component function.
- You can use `onMount` to run a function when the component is mounted.
- You can use `effect` to run a function when any signal/computed changes.
- You can use `For` and `Show` for conditional rendering and list rendering.
- You can pass props to components and access them inside the component function.

- `prop:value={val}` is equivalent to `.value=${val}` in lit-html.
- `bool:checked={val}` is equivalent to `.value=${val}` in lit-html.
- `onClick={val}` is equivalent to `@click=${val}` in lit-html.
More on these later..

## For Component
```tsx
import { For } from "kaori.js";
function List(props: { items: string[] }) {
  return () => (
    <ul>
      <For each={props.items}>
        {(item) => (
          <li>{item}</li>
        )}
      </For>
    </ul>
  );
}
```


## Show Component
```tsx
import { Show } from "kaori.js";
function Conditional(props: { isVisible: boolean }) {
  return () => (
    <div>
      <Show when={props.isVisible}>
        <p>This content is visible!</p>
      </Show>
    </div>
  );
}
```

## Once render 
```tsx
function OnceComponent() {
  return <div>
      <p>This content is rendered only once!</p>
    </div>
  ;
}
```

## Manually trigger updates
```tsx
import { getBloom } from "kaori.js";
function OnceComponent() {
  const bloom = getBloom(); // only call this inside setup code

  let count = 0; 

  function increment() {
    count++;
    bloom.update();
  } 

  return () => (
      <div>
        <p>Count: {count}!</p>
        <button onClick={increment}>Update</button>
      </div>
    )
  ;
}
```

## On Mount
```tsx
import { onMount } from "kaori.js";
function OnMountComponent() {
  onMount(() => {
    console.log("Component mounted!");
  });
  return () => (
      <div>
        <p>This component logs to console when mounted!</p>
      </div>
    )
  ;
}
```

## Effect
```tsx
import { signal, effect } from "kaori.js";
function EffectComponent() {
  const count = signal(0);  

  effect(() => {
    console.log("Count changed:", count.value);
  });

  function increment() {
    count.value++;
  }
  return () => (
      <div>
        <p>Count: {count.value}!</p>
        <button onClick={increment}>Increment</button>
      </div>
    )
  ;
}
```

## onCleanup
```tsx
import { onMount, onCleanup } from "kaori.js";

function CleanupComponent() {
  let id:

  onMount(() => {
    id = setInterval(() => {
      console.log("Interval running");
    }, 1000);
    // will support returning a cleanup function here soon
  });

  onCleanup(() => {
    clearInterval(interval);
    console.log("Interval cleared");
  });

  return () => (
      <div>
        <p>This component sets up an interval and cleans it up on unmount!</p>
      </div>
    );
}
```