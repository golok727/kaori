# Props

Props allow you to pass data from parent to child components. In Kaori, props are reactive by default.

## Passing Props

```tsx
// Define prop types
type ButtonProps = {
  text: string;
  onClick: () => void;
  disabled?: boolean;
};

// Component accepts props
function Button(props: ButtonProps) {
  return () => (
    <button onClick={props.onClick} disabled={props.disabled}>
      {props.text}
    </button>
  );
}

// Usage
<Button text="Click me" onClick={() => console.log('clicked')} />
```

## Props are Reactive

Props maintain reactivity. Never destructure them!

```tsx
// ❌ DON'T - Loses reactivity
function Bad({ count }) {
  return () => <div>{count}</div>;
}

// ✅ DO - Maintains reactivity
function Good(props: { count: number }) {
  return () => <div>{props.count}</div>;
}
```


## Props (Demystified)

Props in Kaori may look like a simple object, but they are more than that. You might think props create a proxy for handling reactivity—but not exactly. While similar in behavior, props are **not** a JavaScript `Proxy`.

Instead, the compiler wraps values that may be reactive into **getter functions** and passes them into the props. This is what powers the reactivity behind the scenes. Let's see how this transformation works.

Suppose we have a component with some reactive state:

```tsx
<Thing name={name.value} count={getCount()} something={thing} num={12} />
````

The compiler transforms it into:

```tsx
import { component } from "kaori.js"

component(Thing, {
  get name() { return name.value },
  get count() { return getCount() },
  something: thing,
  num: 12
})
```

Here’s the magic: whenever a prop expression involves a **function call** or **member access**, the compiler converts it into a getter.

When this prop is accessed inside a **reactive scope** (e.g., a render function or an effect), it gets **automatically tracked**, enabling reactivity without explicit proxies.


## splitProps Helper

Use `splitProps` to organize props when you need to separate them:

```tsx
import { splitProps } from 'kaori.js';

function Button(allProps: ButtonProps & { class?: string }) {
  // Split into specific props and rest
  const [props, rest] = splitProps(allProps, ['children', 'class']);

  return () => (
    <button class={`btn ${props.class || ''}`} {...rest}>
      {props.children}
    </button>
  );
}
```

## mergeProps Helper

Merge multiple prop objects while preserving reactivity:

```tsx
import { mergeProps } from 'kaori.js';

function Component(userProps: Props) {
  const defaultProps = { color: 'blue', size: 'medium' };
  const props = mergeProps(defaultProps, userProps);

  return () => <div style={{ color: props.color }}>{props.size}</div>;
}
```

## Children Prop

Pass children elements:

```tsx
type ContainerProps = {
  children: JSX.Element;
};

function Container(props: ContainerProps) {
  return () => <div class="container">{props.children}</div>;
}

// Usage
<Container>
  <h1>Title</h1>
  <p>Content</p>
</Container>
```

## Spread Props

Spread props to pass them down:

```tsx
import { splitProps } from 'kaori.js';

function CustomButton(initialProps: ComponentProps<'button'>) {
  const [props, rest] = splitProps(allProps, ['class', 'children']);

  return () => (
    <button class={cn(props.class, 'btn-custom')} {...rest}>
      {props.children}
    </button>
  );
}

// Usage - all extra props passed to button
<CustomButton variant="primary" onClick={() => {}} disabled={false}>
  Click
</CustomButton>
```

## Next Steps

- Learn about [Lifecycle](/guide/lifecycle) hooks
- Explore [Components](/guide/components) patterns
