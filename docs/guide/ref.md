## Refs

Refs let you **get direct access** to a DOM element or a component instance —
like a handle you can hold onto.

They’re useful when you want to do something that’s outside Kaori’s reactive flow,
such as focusing an input, reading element size, or integrating a third-party library.

In Kaori, refs work a lot like in React
---

### Basic Usage

You can create a ref using `ref()` and attach it to an element.
Once the element mounts, `ref.value` will contain the actual DOM node.

```tsx
import { createRef, onMount } from "kaori.js";

function App() {
  const el = createRef();

  onMount(() => {
    // access it after dom is painted
    console.log(el.value); // ✅ Logs the <div> element
  });

  return <div ref={el}>hello</div>;
}
```

---

### Passing Refs to Components

Refs can be passed to components just like in React.
When the child receives a `ref` prop, Kaori automatically assigns it to its root element.

```tsx
function Input(props) {
  return <input ref={props.ref} />;
}

function App() {
  const inputRef = createRef<HTMLInputElement>();

  return (
    <div>
      <Input ref={inputRef} />
      <button onClick={() => inputRef.value?.focus()}>Focus</button>
    </div>
  );
}
```

---

### Function Refs

You can also use a **function ref**, which receives the DOM element directly.
Kaori calls this function when the element mounts or unmounts.

```tsx
function App() {
  return (
    <div
      ref={(el) => {
        console.log("mounted:", el);
      }}
    >
      hello
    </div>
  );
}
```

This is handy when you just need one-time access to the element
or want to integrate with libraries that expect raw DOM nodes.

---

### Summary

* Refs are like **handles** to DOM elements or components
* You can create them using `ref()` or as a function `(el: Element) => void`
* They update automatically when elements mount or unmount
* Fully reactive — works seamlessly with Kaori’s signal system
* Passable as props, just like in React

---
