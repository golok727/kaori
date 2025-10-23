# Event Handlers

Event handlers in Kaori use the `on*` attribute pattern, similar to React.

## Basic Event Handling

```tsx
function Button() {
  function handleClick(event: MouseEvent) {
    console.log('Clicked!', event);
  }
  
  return () => <button onClick={handleClick}>Click me</button>;
}
```

## Inline Handlers

```tsx
function Counter() {
  const count = signal(0);
  
  return () => (
    <button onClick={() => count.value++}>
      Count: {count.value}
    </button>
  );
}
```

## Common Events

```tsx
function Form() {
  return () => (
    <div>
      <button onClick={(e) => console.log('click')}>Click</button>
      <input onChange={(e) => console.log('change')} />
      <input onInput={(e) => console.log('input')} />
      <form onSubmit={(e) => e.preventDefault()}>Submit</form>
      <div onMouseEnter={() => {}} onMouseLeave={() => {}}>Hover</div>
      <input onFocus={() => {}} onBlur={() => {}} />
      <input onKeyDown={(e) => {}} onKeyUp={(e) => {}} />
    </div>
  );
}
```

## Event Object

Event handlers receive the native DOM event:

```tsx
function Input() {
  const value = signal('');
  
  function handleInput(event: InputEvent) {
    const target = event.target as HTMLInputElement;
    value.value = target.value;
  }
  
  return () => <input onInput={handleInput} />;
}
```

## Event Options

Pass an object with `handleEvent` method and options:

```tsx
<button onClick={{
  handleEvent: (e) => console.log('clicked'),
  capture: true,
  passive: true,
  once: true
}}>
  Click me
</button>
```

## Preventing Default

```tsx
function Link() {
  function handleClick(e: MouseEvent) {
    e.preventDefault();
    console.log('Link clicked but not navigating');
  }
  
  return () => <a href="/page" onClick={handleClick}>Click</a>;
}
```

## Event Delegation

Events automatically bubble up:

```tsx
function List() {
  function handleListClick(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'LI') {
      console.log('Item clicked:', target.textContent);
    }
  }
  
  return () => (
    <ul onClick={handleListClick}>
      <li>Item 1</li>
      <li>Item 2</li>
      <li>Item 3</li>
    </ul>
  );
}
```

## Best Practices

```tsx
// ✅ Extract handlers for reusability
function handleClick() { }

// ✅ Use event types
function handleChange(e: ChangeEvent) { }

// ✅ Prevent default when needed
function handleSubmit(e: Event) {
  e.preventDefault();
}

// ❌ Don't create functions in render
return () => {
  // Creates new function each render
  const handler = () => {};
  return <button onClick={handler}>Bad</button>;
}
```
