import "./style.css";
import {
	computed,
	render,
	signal,
	For,
	getBloom,
	onCleanup,
	Show,
} from "bloom";

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

	const todos = signal([
		{ id: 1, title: "Learn Bloom", completed: false },
		{ id: 2, title: "Build something awesome", completed: false },
	]);

	function addTodo(title: string) {
		const newTodo = {
			id: todos.value.length + 1,
			title,
			completed: false,
		};
		todos.value = [...todos.value, newTodo];
	}

	function toggleCompleted(id: number) {
		todos.value = todos.value.map((todo) =>
			todo.id === id ? { ...todo, completed: !todo.completed } : todo
		);
	}

	return () => (
		<div>
			<h1>Bloom Playground</h1>

			<Show when={showThing.show}>
				<BloomThing />
			</Show>

			<button className="button-primary" onClick={() => showThing.toggle()}>
				{showThing.show ? "Hide" : "Show"} BloomThing
			</button>

			<Todos
				todos={todos.value}
				addTodo={addTodo}
				toggleCompleted={toggleCompleted}
			/>
		</div>
	);
}

function BloomThing() {
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

	return () => <div>Without signals count: {count}</div>;
}

function Todos(props: {
	todos: Todo[];
	addTodo: (title: string) => void;
	toggleCompleted: (id: number) => void;
}) {
	const newTodoText = signal("");
	const length = computed(() => props.todos.length);
	const numChecked = computed(
		() => props.todos.filter((todo) => todo.completed).length
	);

	const handleInputChange = (ev: InputEvent) => {
		newTodoText.value = (ev.target as HTMLInputElement).value;
	};

	const addTodo = () => {
		const value = newTodoText.value;
		if (value !== "") props.addTodo(value);
	};

	const handleCheckedChange = (id: number) => {
		props.toggleCompleted(id);
	};

	return () => (
		<div>
			<h2>Todos {numChecked.value} Completed</h2>

			<input
				value={newTodoText.value}
				type="text"
				id="new-todo"
				onChange={handleInputChange}
			/>

			<button className="button-primary" onClick={addTodo}>
				addTodo
			</button>

			{length.value === 0 ? (
				<p>No todos</p>
			) : (
				<ul>
					<For items={props.todos} key={(todo) => todo.id}>
						{(todo: Todo) => (
							<li>
								<input
									type="checkbox"
									checked={todo.completed}
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

const root = document.querySelector("#root") as HTMLDivElement;
if (!root) throw new Error("Root element not found");
render(App, { props: { initialCount: 65 }, target: root });

declare global {
	namespace JSX {
		type Element = unknown;

		interface ElementChildrenAttribute {
			children: {}; // This tells TS to use 'children' prop for content between tags
		}

		interface IntrinsicElements {
			[elemName: string]: {
				children?: any;
				[key: string]: any;
			};
		}
	}
}
interface Todo {
	id: number;
	title: string;
	completed: boolean;
}
