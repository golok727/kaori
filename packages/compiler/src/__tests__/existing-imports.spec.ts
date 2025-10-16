import { describe, it, expect } from "vitest";
import babel from "@babel/core";
import jsxToLitHtmlPlugin from "../babel-plugin.js";

async function transformJSX(jsxCode: string) {
	const result = await babel.transformAsync(jsxCode, {
		plugins: [["@babel/plugin-syntax-jsx"], [jsxToLitHtmlPlugin]],
		parserOpts: {
			plugins: ["jsx", "typescript"],
		},
	});
	return result?.code || "";
}

describe("JSX transformation with existing imports", () => {
	it("should handle existing kaori.js imports", async () => {
		const input = `
import {component, computed, html, render, signal} from "kaori.js";

function BloomThing() {
    let count = 0;
    return () => html\`<h1 class="text-lg font-bold"> Without signals count \${count}</h1>\`;
}

function App() {
    return (
        <div>
            <h1>My App</h1>
            <BloomThing />
            <p>Some content</p>
        </div>
    );
}`;

		const output = await transformJSX(input);
		expect(output).toMatchSnapshot();
	});

	it("should handle existing kaori imports from path", async () => {
		const input = `
import {component, computed, html, render, signal, For, getBloom, onCleanup, Show, nothing, onMount} from "/@fs/C:/Users/Radha/dev/frameworks/bloom/packages/kaori/src/index.ts";

function BloomThing() {
    let count = 0;
    return () => html\`<h1 class="text-lg font-bold"> Without signals count \${count}</h1>\`;
}

function App() {
    return (
        <div>
            <h1>My App</h1>
            <BloomThing />
            <p>Some content</p>
        </div>
    );
}`;

		const output = await transformJSX(input);
		expect(output).toMatchSnapshot();
	});

	it("should handle existing html only import", async () => {
		const input = `
import {html, render} from "kaori.js";

function App() {
    return (
        <div>
            <h1>My App</h1>
            <MyComponent />
        </div>
    );
}`;

		const output = await transformJSX(input);
		expect(output).toMatchSnapshot();
	});

	it("should handle existing component only import", async () => {
		const input = `
import {component, render} from "kaori.js";

function App() {
    return (
        <div>
            <h1>My App</h1>
            <MyComponent />
        </div>
    );
}`;

		const output = await transformJSX(input);
		expect(output).toMatchSnapshot();
	});

	it("should handle aliased imports", async () => {
		const input = `
import {component as comp, html as h} from "kaori.js";

function App() {
    return (
        <div>
            <h1>My App</h1>
            <MyComponent />
        </div>
    );
}`;

		const output = await transformJSX(input);
		expect(output).toMatchSnapshot();
	});
});
