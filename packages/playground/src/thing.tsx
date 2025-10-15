import {
	computed,
	html,
	signal,
	type Bloom,
	type ComponentContext,
} from "bloom";

export function App(_: Bloom, props: { initialCount: number }) {
	const count = signal(props.initialCount);
	const checked = signal(false);

	return () => {
		if (count.value === 0x45) {
			return <h1>Nicw !!!</h1>;
		}

		return (
			<div>
				<h1>Count {count.value}</h1>
				<button onClick={() => count.value++}>Increment</button>
				<input
					$prop:checked={checked.value}
					onChange={(ev: any) => (checked.value = ev.target.value)}
				>
					Check
				</input>
				<input $bind:value={checked}>Check 2</input>
				<input
					value={checked.value}
					onChange={(ev: any) => (checked.value = ev.target.value)}
				>
					Check 3
				</input>
			</div>
		);
	};
}

declare global {
	namespace JSX {
		interface IntrinsicElements {
			[elemName: string]: any;
		}
	}
}
interface Todo {
	id: number;
	title: string;
	completed: boolean;
}

export function Todos({
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

	return () => (
		<div>
			<h2>Todos ${numChecked + " Completed"}</h2>
			<input type="text" id="new-todo" change={handleInputChange} />
			<button click={addTodo}>addTodo</button>
			<Switch when={length.value === 0} fallback={<p>No todos</p>}>
				<ul>
					<For each={props.todos} key={(todo: Todo) => todo.id}>
						{(todo: Todo) => (
							<li>
								<input type="checkbox" checked={todo.completed} />${todo.title}
							</li>
						)}
					</For>
				</ul>
			</Switch>
		</div>
	);
}

function For() {}
function Switch() {}
