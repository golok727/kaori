import './style.css';
import Eye from './eye';

import {
  computed,
  render,
  signal,
  For,
  getHandle,
  Show,
  nothing,
  onMount,
  createRef,
  html,
  splitProps,
  type RefOrCallback,
  createContext,
  type Signal,
  useContext,
  provideContext,
  onCleanup,
} from 'kaori.js';

const root = document.querySelector<HTMLDivElement>('#root')!;

function useQuery<T>(options: { query: () => Promise<T>; initialData?: T }) {
  const state = signal<{
    data: T | null;
    error: Error | null;
    loading: boolean;
  }>({
    data: options.initialData ?? null,
    error: null,
    loading: false,
  });

  function setQueryData(data: T) {
    state.value = { data, error: null, loading: false };
  }

  onMount(() => {
    state.value = {
      data: options.initialData ?? null,
      error: null,
      loading: true,
    };

    options
      .query()
      .then(res => {
        state.value = { data: res, error: null, loading: false };
      })
      .catch(err => {
        state.value = { data: null, error: err as Error, loading: false };
      })
      .finally(() => {
        state.value = { ...state.value!, loading: false };
      });
  });

  return {
    get data() {
      return state.value.data;
    },
    get error() {
      return state.value.error;
    },
    get loading() {
      return state.value.loading;
    },
    setQueryData,
  };
}

function fetchTodos() {
  return new Promise<{ id: number; title: string; completed: boolean }[]>(
    resolve => {
      setTimeout(() => {
        resolve([
          { id: 1, title: 'Learn Kaori', completed: false },
          { id: 2, title: 'Build something awesome', completed: false },
        ]);
      }, 2000);
    }
  );
}

function useToggle(initial = false) {
  const state = signal(initial);

  return {
    get show() {
      return state.value;
    },
    toggle() {
      state.value = !state.peek();
    },
    set(value: boolean) {
      state.value = value;
    },
  };
}

function ClassMapThing() {
  const count = signal(9);

  return () => (
    <div>
      <p
        classMap={{
          'text-blue-500': count.value <= 10,
          'text-amber-500': count.value > 10,
        }}
      >
        ClassMap Example Count: {count.value}
      </p>
      <button class="button-primary" onClick={() => count.value++}>
        Click
      </button>
      {html`<input type="checkbox">Span</span>`}
    </div>
  );
}

function StyleThing() {
  return (
    <p
      style={{
        backgroundColor: 'lightblue',
        padding: '10px',
        borderRadius: '6px',
      }}
    >
      Inline styles work property !!
    </p>
  );
}

function SpreadProps(p: {
  onClick: () => void;
  class?: string;
  ref?: RefOrCallback<HTMLButtonElement>;
  children: JSX.JSXElement;
}) {
  const [props, rest] = splitProps(p, ['children']);
  return () => <button {...rest}>{props.children}</button>;
}

const ThemeContext = createContext<Signal<'light' | 'dark'> | null>(null);

function App() {
  const showThing = useToggle(true);

  const query = useQuery({ query: fetchTodos, initialData: [] });

  function addTodo(title: string) {
    const newTodo: Todo = {
      id: query.data!.length + 1,
      title,
      completed: false,
    };
    query.setQueryData([...query.data!, newTodo]);
  }

  function toggleCompleted(id: number) {
    query.setQueryData(
      query.data!.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  let spreadPropsWidth: number | undefined;
  const spreadClickedTimes = signal(0);
  const spreadPropsRef = createRef<HTMLButtonElement>();

  const handle = getHandle();

  onMount(() => {
    if (spreadPropsRef.value) {
      spreadPropsWidth = Math.floor(
        spreadPropsRef.value.getBoundingClientRect().width
      );
      handle.update();
    }
  });

  // provideContext(ThemeContext, signal('light'));

  return () =>
    html`${(
      <ThemeProvider>
        <div>
          <h1 class="text-xl font-bold">Kaori Playground</h1>
          {<ContextExample />}
          <SpreadProps
            ref={spreadPropsRef}
            class="p-2 bg-black text-white rounded-md"
            onClick={() =>
              (spreadClickedTimes.value = spreadClickedTimes.value + 1)
            }
          >
            Spread props clicked {spreadClickedTimes.value}
            {spreadPropsWidth !== undefined
              ? `My Width is ${spreadPropsWidth}px`
              : nothing}
          </SpreadProps>
          <Show when={showThing.show}>
            <KaoriThing />
          </Show>
          <button class="button-primary" onClick={() => showThing.toggle()}>
            {showThing.show ? 'Hide' : 'Show'} Test Life
          </button>
          <StyleThing />
          <RefTest />
          <Eye />
          <ClassMapThing />
          <h1 class="text-xl font-bold">Kaori Playground</h1>
          {query.loading ? <p>Loading todos...</p> : nothing}
          <Todos
            todos={query.data!}
            addTodo={addTodo}
            toggleCompleted={toggleCompleted}
          />
        </div>
      </ThemeProvider>
    )}`;
}

function ThemeProvider(props: { children: JSX.Element }) {
  const theme = signal<'light' | 'dark'>('light');
  provideContext(ThemeContext, theme);

  return () => <div>{props.children}</div>;
}

function ContextExample() {
  const theme = useContext(ThemeContext);
  if (!theme) throw new Error('No theme context found');

  return () => <p>Current theme is {theme.value}</p>;
}

function RefTest() {
  const divRef = createRef<HTMLDivElement>();
  const handle = getHandle();

  let width = 0;

  onMount(() => {
    if (divRef.value) {
      width = Math.floor(divRef.value.getBoundingClientRect().width);
      console.log(width);
      handle.update();
    }
  });

  return () => (
    <div class="p-2 bg-amber-200 rounded" ref={divRef}>
      This div has a width of {width} px
    </div>
  );
}

function KaoriThing() {
  let count = 0;
  const handle = getHandle();

  onMount(() => {
    console.log('component mounted, setting up interval');
    const interval = setInterval(() => {
      count++;
      handle.update();
    }, 1000);

    return () => {
      console.log('component unmounted, clearing interval');
      clearInterval(interval);
    };
  });

  return () => (
    <h1 class="text-lg font-bold"> Without signals count {count}</h1>
  );
}

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

function Todos(props: {
  todos: Todo[];
  addTodo: (title: string) => void;
  toggleCompleted: (id: number) => void;
}) {
  const newTodoText = signal('');
  const error = signal<string | null>(null);

  const length = computed(() => props.todos.length);

  const numChecked = computed(
    () => props.todos.filter(todo => todo.completed).length
  );

  const handleInputChange = (ev: InputEvent) => {
    newTodoText.value = (ev.target as HTMLInputElement).value;
  };

  const addTodo = () => {
    const value = newTodoText.value;
    if (value === '') {
      error.value = 'Todo cannot be empty';
      setTimeout(() => {
        error.value = null;
      }, 1000);
    } else {
      error.value = null;
      props.addTodo(value);
      newTodoText.value = '';
    }
  };

  const handleCheckedChange = (id: number) => {
    props.toggleCompleted(id);
  };

  return () => (
    <div>
      <h2>Todos {numChecked.value + ' Completed'}</h2>
      {error.value ? <p class="text-red-600">{error.value}</p> : nothing}
      <input
        prop:value={newTodoText.value}
        class="py-2 px-2 border border-gray-300 rounded"
        type="text"
        id="new-todo"
        onChange={handleInputChange}
      />
      <button class="button-primary" onClick={addTodo}>
        addTodo
      </button>

      {length.value === 0 ? (
        <p>No todos</p>
      ) : (
        <ul>
          <For items={props.todos} key={todo => todo.id}>
            {todo => (
              <li class={`${todo.completed ? 'line-through' : ''}`}>
                <input
                  type="checkbox"
                  bool:checked={todo.completed}
                  onChange={() => handleCheckedChange(todo.id)}
                />
                {todo.title}
              </li>
            )}
          </For>
        </ul>
      )}
    </div>
  );
}
// function Child() {
//   onMount(() => {
//     console.log('Child mounted');
//   });
//   onCleanup(() => {
//     console.log('Child unmounted');
//   });
//   return (
//     <div>
//       Child
//       <GrandChild />
//     </div>
//   );
// }

// function GrandChild() {
//   onMount(() => {
//     console.log('Grand Child mounted');
//   });
//   onCleanup(() => {
//     console.log('Grand Child unmounted');
//   });
//   return <div>GrandChild</div>;
// }

// function Sibiling() {
//   onMount(() => {
//     console.log('Sibiling mounted');
//   });
//   onCleanup(() => {
//     console.log('Sibiling unmounted');
//   });
//   return () => <div>Sibiling</div>;
// }

// function Parent() {
//   onMount(() => {
//     console.log('Parent mounted');
//   });
//   onCleanup(() => {
//     console.log('Parent unmounted');
//   });
//   return () => (
//     <div>
//       <span>Parent</span>
//       <Child />
//     </div>
//   );
// }

// function Container() {
//   const show = signal(true);
//   return () => (
//     <div>
//       <button class="button-primary" onClick={() => (show.value = !show.value)}>
//         Toggle {show.value ? 'Hide' : 'Show'}
//       </button>
//       <Show when={show.value}>
//         <Parent />
//         <Sibiling />
//       </Show>
//     </div>
//   );
// }

render(html`${(<App />)}`, root);
