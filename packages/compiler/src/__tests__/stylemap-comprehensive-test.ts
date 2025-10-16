// Comprehensive test showing styleMap works with different scenarios
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

// Test comprehensive scenario with all attribute types including style
const comprehensiveTest = `
function App() {
  const styles = { color: 'red', fontSize: '20px' };
  const btnStyles = { backgroundColor: 'blue', padding: '10px' };
  
  return (
    <div className="container" style={styles}>
      <h1>Title</h1>
      <button 
        style={btnStyles}
        onClick={handleClick}
        prop:disabled={isDisabled()}
      >
        Click Me
      </button>
      <input 
        type="text"
        style={{ border: '1px solid black' }}
        prop:value={getValue()}
      />
      <p style="color: green;">Static style string</p>
    </div>
  );
}`;

// Test with existing styleMap import
const existingImportTest = `
import { html, styleMap } from "kaori.js";

function App() {
  const styles = { color: 'red' };
  return <div style={styles}>Hello</div>;
}`;

// Test with aliased styleMap import
const aliasedImportTest = `
import { styleMap as sm } from "kaori.js";

function App() {
  const styles = { color: 'red' };
  return <div style={styles}>Hello</div>;
}`;

// Test with styleMap variable conflict
const conflictTest = `
function App() {
  const styleMap = "I'm a variable named styleMap";
  const styles = { color: 'red' };
  return <div style={styles}>{styleMap}</div>;
}`;

// Test with multiple elements using style
const multipleStylesTest = `
function App() {
  const headerStyles = { fontSize: '24px', fontWeight: 'bold' };
  const contentStyles = { padding: '20px' };
  
  return (
    <div>
      <header style={headerStyles}>Header</header>
      <main style={contentStyles}>
        <p style={{ color: 'gray' }}>Content</p>
      </main>
    </div>
  );
}`;

// Test combining style with ref directive
const styleWithRefTest = `
import { createRef } from "kaori.js";

function App() {
  const divRef = createRef();
  const styles = { color: 'red', padding: '10px' };
  
  return <div ref={divRef} style={styles}>Hello</div>;
}`;

async function runAllTests() {
	console.log("🎨 Running Comprehensive StyleMap Tests");

	await runTest("Comprehensive with Multiple Style Types", comprehensiveTest);
	await runTest("Existing styleMap Import", existingImportTest);
	await runTest("Aliased styleMap Import", aliasedImportTest);
	await runTest("StyleMap Variable Conflict", conflictTest);
	await runTest("Multiple Elements with Styles", multipleStylesTest);
	await runTest("Style with Ref Directive", styleWithRefTest);

	console.log("\n✅ All comprehensive tests completed!");
}

runAllTests();
