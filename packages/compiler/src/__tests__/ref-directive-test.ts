// Test for ref directive feature - Happy Birthday! 🎂🎉
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

// Test 1: Basic ref usage
const basicRefTest = `
import { createRef } from "kaori.js";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

// Test 2: Ref with existing ref import
const existingRefImportTest = `
import { ref, createRef, html } from "kaori.js";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

// Test 3: Ref with conflicting name (should use ref_1 or similar)
const refConflictTest = `
function App() {
  const ref = "some variable";
  const myRef = createRef();
  return <div ref={myRef}>Hello {ref}</div>;
}`;

// Test 4: Multiple refs in one component
const multipleRefsTest = `
import { createRef } from "kaori.js";

function App() {
  const inputRef = createRef();
  const buttonRef = createRef();
  const divRef = createRef();
  
  return (
    <div ref={divRef}>
      <input ref={inputRef} type="text" />
      <button ref={buttonRef} onClick={handleClick}>
        Click me
      </button>
    </div>
  );
}`;

// Test 5: Ref with other attributes
const refWithOtherAttributesTest = `
import { createRef } from "kaori.js";

function App() {
  const inputRef = createRef();
  
  return (
    <input 
      ref={inputRef}
      type="text"
      className="input"
      prop:value={getValue()}
      bool:disabled={isDisabled()}
      onChange={handleChange}
      placeholder="Enter text"
    />
  );
}`;

// Test 6: Ref in nested elements
const nestedRefTest = `
import { createRef } from "kaori.js";

function App() {
  const outerRef = createRef();
  const innerRef = createRef();
  
  return (
    <div ref={outerRef} className="outer">
      <section>
        <p ref={innerRef}>Nested content</p>
      </section>
    </div>
  );
}`;

// Test 7: Ref with dynamic expression
const refDynamicTest = `
import { createRef } from "kaori.js";

function App() {
  const myRef = createRef();
  const shouldUseRef = true;
  
  return (
    <div ref={shouldUseRef ? myRef : undefined}>
      Conditional ref
    </div>
  );
}`;

// Test 8: Ref with inline createRef
const refInlineCreateTest = `
import { createRef } from "kaori.js";

function App() {
  return <div ref={createRef()}>Inline ref</div>;
}`;

// Test 9: Ref with component (should not process - refs are for HTML elements in this context)
const refOnComponentTest = `
import { createRef } from "kaori.js";

function App() {
  const myRef = createRef();
  
  return (
    <>
      <MyComponent ref={myRef} />
      <div ref={myRef}>HTML element</div>
    </>
  );
}`;

// Test 10: Self-closing element with ref
const selfClosingRefTest = `
import { createRef } from "kaori.js";

function App() {
  const inputRef = createRef();
  const imgRef = createRef();
  
  return (
    <>
      <input ref={inputRef} type="text" />
      <img ref={imgRef} src="/logo.png" alt="Logo" />
    </>
  );
}`;

// Test 11: Ref with existing kaori imports from path
const refWithPathImportTest = `
import { createRef, html, component } from "/@fs/C:/Users/Radha/dev/frameworks/kaori/packages/kaori/src/index.ts";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

// Test 12: Aliased ref import
const aliasedRefImportTest = `
import { ref as litRef, createRef } from "kaori.js";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

async function runAllTests() {
	console.log("🎂 Running Ref Directive Tests - Happy Birthday Edition! 🎉");

	await runTest("Basic ref usage", basicRefTest);
	await runTest("Ref with existing ref import", existingRefImportTest);
	await runTest("Ref with conflicting name", refConflictTest);
	await runTest("Multiple refs in one component", multipleRefsTest);
	await runTest("Ref with other attributes", refWithOtherAttributesTest);
	await runTest("Ref in nested elements", nestedRefTest);
	await runTest("Ref with dynamic expression", refDynamicTest);
	await runTest("Ref with inline createRef", refInlineCreateTest);
	await runTest("Ref on component", refOnComponentTest);
	await runTest("Self-closing element with ref", selfClosingRefTest);
	await runTest("Ref with path import", refWithPathImportTest);
	await runTest("Aliased ref import", aliasedRefImportTest);

	console.log("\n🎉 All ref directive tests completed! No tears today! 🎂");
}

runAllTests();
