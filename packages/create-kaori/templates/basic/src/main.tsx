import { signal, computed, render, Show } from "kaori.js";

function Starter(props: { name: string }) {
	const count = signal(0);
	const double = computed(() => count.value * 2);
	const cond = computed(() => count.value > 3); // auto memoization coming soon :)

	function increment() {
		count.value++;
	}

	return () => (
		<div>
			<h1>Welcome to Kaori ^^</h1>
			<p>Hello, {props.name}</p>
			<button onClick={increment}>Click Me!</button>
			<p>Count: {count.value}</p>
			<p>Double: {double.value}</p>
			<Show when={cond.value}>Count is greater than 3!</Show>
		</div>
	);
}

const root = document.getElementById("#root") as HTMLElement;
render(<Starter name={"Kaori"} />, root);
