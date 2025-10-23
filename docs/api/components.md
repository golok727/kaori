# Components API

Built-in components for control flow.

## For

Efficiently renders lists with proper keying.

```tsx
import { For } from 'kaori.js';

<For items={items} key={(item) => item.id}>
  {(item, index) => <li>{item.name}</li>}
</For>
```

### Props

```ts
type ForProps<Item> = {
  items: Iterable<Item>;
  children: (item: Item, index: number) => JSX.Element;
  key?: (item: Item, index: number) => unknown;
}
```

### Parameters

- `items` - Iterable of items to render
- `children` - Render function receiving (item, index)
- `key` - Optional key function for efficient updates

### Example

```tsx
type Todo = { id: number; text: string };

function TodoList(props: { todos: Todo[] }) {
  return () => (
    <ul>
      <For items={props.todos} key={(todo) => todo.id}>
        {(todo, index) => (
          <li>
            {index + 1}. {todo.text}
          </li>
        )}
      </For>
    </ul>
  );
}
```

## Show

Conditionally renders content without parent re-renders.

```tsx
import { Show } from 'kaori.js';

<Show when={condition.value} fallback={() => <div>Else</div>}>
  <div>Then</div>
</Show>
```

### Props

```ts
type ShowProps = {
  when: boolean;
  children: JSX.Element;
  fallback?: () => JSX.Element;
}
```

### Parameters

- `when` - Condition to evaluate
- `children` - Content to render when true
- `fallback` - Optional content to render when false

### Example

```tsx
function UserProfile() {
  const user = signal<User | null>(null);
  
  return () => (
    <Show 
      when={user.value !== null}
      fallback={() => <div>Please log in</div>}
    >
      <div>Welcome, {user.value!.name}!</div>
    </Show>
  );
}
```
