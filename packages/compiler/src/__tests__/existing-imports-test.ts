// todo add vitest
import babel from "@babel/core";
import jsxToLitHtmlPlugin from "../babel-plugin.js";

async function runTest(testName: string, jsxCode: string) {
	console.log(`\n=== ${testName} ===`);
	try {
		const result = await babel.transformAsync(jsxCode, {
			plugins: [["@babel/plugin-syntax-jsx"], [jsxToLitHtmlPlugin]],
			parserOpts: {
				plugins: ["jsx", "typescript"],
			},
		});

		console.log("Input JSX:");
		console.log(jsxCode.trim());
		console.log("\nTransformed Output:");
		console.log(result?.code || "No output");
		console.log("\n" + "=".repeat(50));
	} catch (error) {
		console.error("Transformation failed:", error);
	}
}

// Test: File with existing kaori imports (like the user's scenario)
const existingKaoriImportsTest = `
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

// Test: File with existing kaori imports from different path (user's actual scenario)
const existingKaoriImportsFromPathTest = `
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

// Test: File with existing html import but no component import
const existingHtmlOnlyTest = `
import {html, render} from "kaori.js";

function App() {
    return (
        <div>
            <h1>My App</h1>
            <MyComponent />
        </div>
    );
}`;

// Test: File with existing component import but no html import
const existingComponentOnlyTest = `
import {component, render} from "kaori.js";

function App() {
    return (
        <div>
            <h1>My App</h1>
            <MyComponent />
        </div>
    );
}`;

// Test: File with aliased imports
const aliasedImportsTest = `
import {component as comp, html as h} from "kaori.js";

function App() {
    return (
        <div>
            <h1>My App</h1>
            <MyComponent />
        </div>
    );
}`;

async function runAllTests() {
	console.log("🧪 Running Existing Imports Tests");

	await runTest("Existing kaori.js imports", existingKaoriImportsTest);
	await runTest(
		"Existing kaori imports from path",
		existingKaoriImportsFromPathTest
	);
	await runTest("Existing html only", existingHtmlOnlyTest);
	await runTest("Existing component only", existingComponentOnlyTest);
	await runTest("Aliased imports", aliasedImportsTest);

	console.log("\n✅ All existing imports tests completed!");
}

runAllTests();
