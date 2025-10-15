import "./style.css";
import {
	component,
	computed,
	html,
	render,
	repeat,
	signal,
	type ComponentContext,
} from "bloom";

const root = document.querySelector<HTMLDivElement>("#root")!;

function App() {
	const todos = signal<Todo[]>([
		{ id: 1, title: "Learn Bloom", completed: false },
		{ id: 2, title: "Build something awesome", completed: false },
	]);

	function addTodo(title: string) {
		const newTodo: Todo = {
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

	return () =>
		html`<div>
			<h1>Bloom Playground</h1>
			${component(Todos, {
				get todos() {
					return todos.value;
				},
				addTodo,
				toggleCompleted,
			})}
		</div>`;
}

function StaticComponent({ props }: ComponentContext<{ count: number }>) {
	return () => html`<div>This is ${props.count} static content</div>`;
}

type Todo = {
	id: number;
	title: string;
	completed: boolean;
};

function Todos({
	props,
}: ComponentContext<{
	todos: Todo[];
	addTodo: (title: string) => void;
	toggleCompleted: (id: number) => void;
}>) {
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
		if (value !== "") {
			props.addTodo(value);
		}
	};

	const handleCheckedChange = (id: number) => {
		props.toggleCompleted(id);
	};

	return () => html`<div>
		<h2>Todos ${numChecked.value + " Completed"}</h2>
		<input
			.value=${newTodoText.value}
			type="text"
			id="new-todo"
			@change=${handleInputChange}
		/>
		<button @click=${addTodo}>addTodo</button>
		${length.value === 0
			? html`<p>No todos</p>`
			: html`<ul>
					${repeat(
						props.todos,
						(todo) => todo.id,
						(todo) => html`<li>
							<input
								type="checkbox"
								?checked=${todo.completed}
								@change=${() => handleCheckedChange(todo.id)}
							/>
							${todo.title}
						</li>`
					)}
			  </ul>`}
	</div>`;
}

function Counter({ props }: ComponentContext<{ initialCount: number }>) {
	const count = signal(props.initialCount * 2);
	console.log("Counter render");

	return () => html`<div>
		<h2>Count ${count.value}</h2>
		${component(StaticComponent, {
			count: count.value,
		})}
		<button @click=${() => count.value++}>Increment</button>
	</div>`;
}

render(App, { props: { initialCount: 65 }, target: root });
