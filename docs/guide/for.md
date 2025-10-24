# For Component

The `For` component efficiently renders lists with proper keying and minimal DOM updates.

## Basic Usage

```tsx
import { For } from 'kaori.js';

function TodoList(props: { todos: string[] }) {
  return () => (
    <ul>
      <For items={props.todos}>{(item, index) => <li>{item}</li>}</For>
    </ul>
  );
}
```

## With Keys

Use keys for efficient list updates when items can be reordered:

```tsx
import { signal, For } from 'kaori.js';

type Todo = { id: number; text: string };

function TodoList() {
  const todos = signal<Todo[]>([
    { id: 1, text: 'Learn Kaori' },
    { id: 2, text: 'Build app' },
  ]);

  return () => (
    <ul>
      <For items={todos.value} key={todo => todo.id}>
        {todo => <li>{todo.text}</li>}
      </For>
    </ul>
  );
}
```

## Why Use For?

### Without For (Array.map)

```tsx
function List() {
  const items = signal(['a', 'b', 'c']);

  // ❌ Recreates all DOM nodes on reorder
  return () => (
    <ul>
      {items.value.map(item => (
        <li>{item}</li>
      ))}
    </ul>
  );
}
```

### With For

```tsx
function List() {
  const items = signal(['a', 'b', 'c']);

  // ✅ Reuses DOM nodes efficiently
  return () => (
    <ul>
      <For items={items.value} key={item => item}>
        {item => <li>{item}</li>}
      </For>
    </ul>
  );
}
```

## Access Index

The second parameter is the index:

```tsx
<For items={items.value}>
  {(item, index) => (
    <li>
      {index + 1}. {item}
    </li>
  )}
</For>
```

## Performance Tips

1. **Always use keys for dynamic lists**

   ```tsx
   <For items={list} key={(item) => item.id}>
   ```

2. **Use stable keys**

   ```tsx
   // ✅ Good - stable ID
   key={(item) => item.id}

   // ❌ Bad - if order changes
   key={(item, index) => index}
   ```

> You can always use `Array.map` if the iterable is static.

## Complete Example

```tsx
import { signal, For } from 'kaori.js';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

function TodoApp() {
  const todos = signal<Todo[]>([]);
  const input = signal('');

  function addTodo() {
    if (!input.value) return;
    todos.value = [
      ...todos.value,
      { id: Date.now(), text: input.value, completed: false },
    ];
    input.value = '';
  }

  function toggleTodo(id: number) {
    todos.value = todos.value.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    );
  }

  function removeTodo(id: number) {
    todos.value = todos.value.filter(todo => todo.id !== id);
  }

  return () => (
    <div>
      <input
        prop:value={input.value}
        onChange={e => (input.value = e.target.value)}
        onKeyDown={e => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add</button>

      <ul>
        <For items={todos.value} key={todo => todo.id}>
          {todo => (
            <li classMap={{ completed: todo.completed }}>
              <input
                type="checkbox"
                bool:checked={todo.completed}
                onChange={() => toggleTodo(todo.id)}
              />
              {todo.text}
              <button onClick={() => removeTodo(todo.id)}>×</button>
            </li>
          )}
        </For>
      </ul>
    </div>
  );
}
```

## Next Steps

- Learn about [Show Component](/guide/show)
- Explore [Event Handlers](/guide/events)
- Check out [Examples](/examples/todo-list)
