import './style.css';
import { signal, computed, render, Show } from 'kaori.js';

function App(props: { name: string }) {
  const count = signal(0);
  const double = computed(() => count.value * 2);
  const cond = computed(() => count.value > 3); // auto memoization coming soon :)

  function increment() {
    count.value++;
  }

  return () => (
    <div class="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <h1 class="text-4xl font-bold">Welcome to Kaori ^^</h1>
      <p class="text-lg">Hello, {props.name}</p>
      <button 
        class="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        onClick={increment}
      >
        Click Me!
      </button>
      <p class="text-lg">Count: {count.value}</p>
      <p class="text-lg">Double: {double.value}</p>
      <Show when={cond.value}>
        <p class="text-green-600 font-semibold">Count is greater than 3!</p>
      </Show>
    </div>
  );
}

const root = document.getElementById('root') as HTMLElement;
render(<App name={'Kaori'} />, root);
