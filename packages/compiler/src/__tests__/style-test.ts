// Test for styleMap
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

// Test 1: Style attribute with object expression
const styleObjectTest = `
function TestStyle() {
  const styles = { color: 'red', fontSize: '20px' };
  return <div style={styles}>Hello</div>;
}`;

// Test 2: Style attribute with inline object
const styleInlineObjectTest = `
function TestInlineStyle() {
  return <div style={{ color: 'blue', margin: '10px' }}>Hello</div>;
}`;

// Test 3: Style attribute with string (should remain unchanged)
const styleStringTest = `
function TestStringStyle() {
  return <div style="color: green;">Hello</div>;
}`;

// Test 4: Style attribute with complex expression
const styleComplexTest = `
function TestComplexStyle() {
  const baseStyles = { color: 'red' };
  return <div style={{ ...baseStyles, fontSize: '20px' }}>Hello</div>;
}`;

async function runAllTests() {
	console.log("🧪 Running Style Attribute Tests");

	await runTest("Style with Object Variable", styleObjectTest);
	await runTest("Style with Inline Object", styleInlineObjectTest);
	await runTest("Style with String (unchanged)", styleStringTest);
	await runTest("Style with Complex Expression", styleComplexTest);

	console.log("\n✅ All tests completed!");
}

runAllTests();
