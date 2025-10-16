// Test edge cases for styleMap
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

// Test with conditional expression
const conditionalTest = `
function App() {
  const isActive = true;
  const activeStyles = { color: 'blue' };
  const inactiveStyles = { color: 'gray' };
  
  return <div style={isActive ? activeStyles : inactiveStyles}>Content</div>;
}`;

// Test with function call returning styles
const functionCallTest = `
function App() {
  function getStyles() {
    return { color: 'red', fontSize: '16px' };
  }
  
  return <div style={getStyles()}>Content</div>;
}`;

// Test with member expression
const memberExpressionTest = `
function App() {
  const theme = {
    primary: { color: 'blue', backgroundColor: 'lightblue' },
    secondary: { color: 'gray', backgroundColor: 'lightgray' }
  };
  
  return (
    <div>
      <button style={theme.primary}>Primary</button>
      <button style={theme.secondary}>Secondary</button>
    </div>
  );
}`;

// Test with spread operator
const spreadTest = `
function App() {
  const baseStyles = { padding: '10px' };
  
  return (
    <div style={{ ...baseStyles, color: 'red' }}>Content</div>
  );
}`;

// Test with computed property
const computedPropertyTest = `
function App() {
  const prop = 'color';
  
  return <div style={{ [prop]: 'red', fontSize: '14px' }}>Content</div>;
}`;

// Test logical AND/OR
const logicalTest = `
function App() {
  const showStyles = true;
  const styles = { color: 'red' };
  
  return <div style={showStyles && styles}>Content</div>;
}`;

async function runAllTests() {
	console.log("🧪 Running StyleMap Edge Cases Tests");

	await runTest("Conditional Expression", conditionalTest);
	await runTest("Function Call", functionCallTest);
	await runTest("Member Expression", memberExpressionTest);
	await runTest("Spread Operator", spreadTest);
	await runTest("Computed Property", computedPropertyTest);
	await runTest("Logical AND/OR", logicalTest);

	console.log("\n✅ All edge case tests completed!");
}

runAllTests();
