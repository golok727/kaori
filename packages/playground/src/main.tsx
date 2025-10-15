import "./style.css";
import {
	computed,
	render,
	signal,
	For,
	getBloom,
	onCleanup,
	Show,
	nothing,
	onMount,
} from "kaori.js";

const root = document.querySelector<HTMLDivElement>("#root")!;

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
			.then((res) => {
				state.value = { data: res, error: null, loading: false };
			})
			.catch((err) => {
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
		(resolve) => {
			setTimeout(() => {
				resolve([
					{ id: 1, title: "Learn Bloom", completed: false },
					{ id: 2, title: "Build something awesome", completed: false },
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
			query.data!.map((todo) =>
				todo.id === id ? { ...todo, completed: !todo.completed } : todo
			)
		);
	}

	return () => (
		<div>
			<h1 class="text-xl font-bold">Bloom Playground</h1>
			<Show when={showThing.show}>
				<KaoriThing />
			</Show>
			<button class="button-primary" onClick={() => showThing.toggle()}>
				{showThing.show ? "Hide" : "Show"} BloomThing
			</button>
			<h1 class="text-xl font-bold">Bloom Playground</h1>
			{query.loading ? <p>Loading todos...</p> : nothing}
			<Todos
				todos={query.data!}
				addTodo={addTodo}
				toggleCompleted={toggleCompleted}
			/>
		</div>
	);
}

function KaoriThing() {
	let count = 0;
	const bloom = getBloom();

	let id = setInterval(() => {
		count++;
		bloom.update();
	}, 1000);

	onCleanup(() => {
		console.log("component unmounted, clearing interval");
		clearInterval(id);
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
	const newTodoText = signal("");
	const error = signal<string | null>(null);

	const length = computed(() => props.todos.length);

	const numChecked = computed(
		() => props.todos.filter((todo) => todo.completed).length
	);

	const handleInputChange = (ev: InputEvent) => {
		newTodoText.value = (ev.target as HTMLInputElement).value;
	};

	const addTodo = () => {
		const value = newTodoText.value;
		if (value === "") {
			error.value = "Todo cannot be empty";
			setTimeout(() => {
				error.value = null;
			}, 1000);
		} else {
			error.value = null;
			props.addTodo(value);
			newTodoText.value = "";
		}
	};

	const handleCheckedChange = (id: number) => {
		props.toggleCompleted(id);
	};

	return () => (
		<div>
			<h2>Todos {numChecked.value + " Completed"}</h2>
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
					<For items={props.todos} key={(todo) => todo.id}>
						{(todo) => (
							<li class={`${todo.completed ? "line-through" : ""}`}>
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

function Starter(props: { name: string }) {
	const count = signal(0);
	const double = computed(() => count.value * 2);
	// auto memoization coming soon :)
	const cond = computed(() => count.value > 3);

	function increment() {
		count.value++;
	}

	return () => (
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

render(<Starter name={"Aadi"} />, root);
// render(<App />, root);
