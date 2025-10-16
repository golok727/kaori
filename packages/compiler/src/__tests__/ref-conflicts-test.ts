// Comprehensive test for ref directive with various naming conflicts 🎂
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

// Test 1: Simple ref variable conflict
const simpleRefVariableConflict = `
function App() {
  const ref = "I'm a variable named ref";
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

// Test 2: ref as function name
const refFunctionConflict = `
function App() {
  function ref(element) {
    console.log("Custom ref function", element);
  }
  
  const divRef = createRef();
  return <div ref={divRef}>Content</div>;
}`;

// Test 3: ref1 also conflicts (should use ref2)
const ref1AlsoConflicts = `
function App() {
  const ref = "original";
  const ref1 = "also taken";
  const myRef = createRef();
  return <div ref={myRef}>Content</div>;
}`;

// Test 4: Multiple conflicts (ref, ref1, ref2 all taken)
const multipleRefsConflict = `
function App() {
  const ref = "taken";
  const ref1 = "also taken";
  const ref2 = "still taken";
  const myRef = createRef();
  return <div ref={myRef}>Content</div>;
}`;

// Test 5: ref as parameter name
const refParameterConflict = `
function App({ ref }) {
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

// Test 6: ref in destructuring
const refDestructuringConflict = `
function App() {
  const { ref } = props;
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

// Test 7: ref as class property
const refClassPropertyConflict = `
class App {
  ref = "class property";
  
  render() {
    const myRef = createRef();
    return <div ref={myRef}>{this.ref}</div>;
  }
}`;

// Test 8: ref in nested scope
const refNestedScopeConflict = `
function App() {
  const myRef = createRef();
  
  function innerFunc() {
    const ref = "inner scope";
    return ref;
  }
  
  return <div ref={myRef}>{innerFunc()}</div>;
}`;

// Test 9: ref imported from different package
const refImportedFromDifferentPackage = `
import { ref } from "some-other-package";

function App() {
  const myRef = createRef();
  const otherRef = ref();
  return <div ref={myRef}>{otherRef}</div>;
}`;

// Test 10: ref with both variable and html/component conflicts
const multipleImportConflicts = `
function App() {
  const ref = "variable";
  const html = "also a variable";
  const component = "another variable";
  const myRef = createRef();
  
  return (
    <div ref={myRef}>
      {ref} {html} {component}
      <MyComponent />
    </div>
  );
}`;

// Test 11: Arrow function with ref parameter
const arrowFunctionRefParameter = `
const App = ({ ref }) => {
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
};`;

// Test 12: ref as const in upper scope
const refConstInUpperScope = `
const ref = "global ref";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

// Test 13: Multiple elements with refs and conflict
const multipleElementsWithRefsAndConflict = `
function App() {
  const ref = "conflict";
  const inputRef = createRef();
  const buttonRef = createRef();
  const divRef = createRef();
  
  return (
    <div ref={divRef}>
      {ref}
      <input ref={inputRef} type="text" />
      <button ref={buttonRef}>Click</button>
    </div>
  );
}`;

// Test 14: ref in object property
const refInObjectProperty = `
function App() {
  const config = { ref: "property" };
  const myRef = createRef();
  return <div ref={myRef}>{config.ref}</div>;
}`;

// Test 15: Complex scenario with all types of conflicts
const complexAllConflicts = `
import { ref as externalRef } from "other-package";

const ref = "global";

function App({ ref: propRef }) {
  const ref1 = "local";
  const { ref: destructuredRef } = props;
  
  function ref2() {
    return "function";
  }
  
  const myRef = createRef();
  const anotherRef = createRef();
  
  return (
    <div ref={myRef}>
      {ref} {ref1} {ref2()} {propRef} {destructuredRef} {externalRef}
      <p ref={anotherRef}>Multiple refs</p>
    </div>
  );
}`;

async function runAllTests() {
	console.log(
		"🎂 Testing Ref Directive with Conflicting Names - Birthday Special! 🎉"
	);

	await runTest("Simple ref variable conflict", simpleRefVariableConflict);
	await runTest("ref as function name", refFunctionConflict);
	await runTest("ref1 also conflicts (should use ref2)", ref1AlsoConflicts);
	await runTest(
		"Multiple conflicts (ref, ref1, ref2 all taken)",
		multipleRefsConflict
	);
	await runTest("ref as parameter name", refParameterConflict);
	await runTest("ref in destructuring", refDestructuringConflict);
	await runTest("ref as class property", refClassPropertyConflict);
	await runTest("ref in nested scope", refNestedScopeConflict);
	await runTest(
		"ref imported from different package",
		refImportedFromDifferentPackage
	);
	await runTest(
		"Multiple import conflicts (ref, html, component)",
		multipleImportConflicts
	);
	await runTest("Arrow function with ref parameter", arrowFunctionRefParameter);
	await runTest("ref as const in upper scope", refConstInUpperScope);
	await runTest(
		"Multiple elements with refs and conflict",
		multipleElementsWithRefsAndConflict
	);
	await runTest("ref in object property", refInObjectProperty);
	await runTest(
		"Complex scenario with all types of conflicts",
		complexAllConflicts
	);

	console.log(
		"\n🎉 All conflict tests completed! Your birthday gift - zero tears! 🎂✨"
	);
}

runAllTests();
