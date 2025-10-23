# Todo List

A complete todo list application with add, toggle, and remove functionality.

## Code

```tsx
import { signal, computed, For, Show, render } from 'kaori.js';

type Todo = {
  id: number;
  text: string;
  completed: boolean;
};

function TodoApp() {
  const todos = signal<Todo[]>([]);
  const input = signal('');
  
  const remaining = computed(
    () => todos.value.filter(t => !t.completed).length
  );
  
  function addTodo() {
    const text = input.value.trim();
    if (!text) return;
    
    todos.value = [
      ...todos.value,
      { id: Date.now(), text, completed: false }
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
  
  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      addTodo();
    }
  }
  
  return () => (
    <div class="todo-app">
      <h1>My Todos</h1>
      
      <div class="input-section">
        <input
          type="text"
          prop:value={input.value}
          onChange={(e) => input.value = e.target.value}
          onKeyDown={handleKeyDown}
          placeholder="What needs to be done?"
        />
        <button onClick={addTodo}>Add</button>
      </div>
      
      <Show
        when={todos.value.length > 0}
        fallback={() => <p class="empty">No todos yet!</p>}
      >
        <ul class="todo-list">
          <For items={todos.value} key={(todo) => todo.id}>
            {(todo) => (
              <li classMap={{ completed: todo.completed }}>
                <input
                  type="checkbox"
                  bool:checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />
                <span class="todo-text">{todo.text}</span>
                <button 
                  class="delete-btn"
                  onClick={() => removeTodo(todo.id)}
                >
                  ×
                </button>
              </li>
            )}
          </For>
        </ul>
        
        <div class="footer">
          <span>{remaining.value} items left</span>
        </div>
      </Show>
    </div>
  );
}

render(<TodoApp />, document.getElementById('root')!);
```

## Styling

```css
.todo-app {
  max-width: 600px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 24px rgba(255, 107, 157, 0.1);
}

.todo-app h1 {
  text-align: center;
  color: #ff6b9d;
  margin-bottom: 2rem;
}

.input-section {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.input-section input {
  flex: 1;
  padding: 0.75rem;
  border: 2px solid #ffd6e5;
  border-radius: 8px;
  font-size: 1rem;
}

.input-section button {
  padding: 0.75rem 2rem;
  background: #ff6b9d;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.input-section button:hover {
  background: #ff4d88;
}

.todo-list {
  list-style: none;
  padding: 0;
}

.todo-list li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-bottom: 1px solid #ffd6e5;
  transition: background 0.2s;
}

.todo-list li:hover {
  background: #fef3f7;
}

.todo-list li.completed .todo-text {
  text-decoration: line-through;
  opacity: 0.5;
}

.todo-text {
  flex: 1;
  font-size: 1rem;
}

.delete-btn {
  background: none;
  border: none;
  color: #ff6b9d;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.delete-btn:hover {
  background: #ffe0eb;
}

.footer {
  margin-top: 1rem;
  padding: 1rem;
  text-align: center;
  color: #90a4b7;
}

.empty {
  text-align: center;
  color: #90a4b7;
  padding: 2rem;
}
```
