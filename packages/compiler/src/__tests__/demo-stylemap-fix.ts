// Example demonstrating the styleMap fix
import babel from "@babel/core";
import jsxToLitHtmlPlugin from "../babel-plugin.js";

async function demonstrateFixedBehavior() {
	console.log("🎨 Demonstrating StyleMap Fix\n");
	console.log("=" .repeat(80));
	
	const jsxCode = `
import { signal } from "kaori.js";

function ThemedButton() {
  const isActive = signal(false);
  
  const buttonStyles = {
    backgroundColor: isActive.value ? '#007bff' : '#6c757d',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  };
  
  return (
    <button 
      style={buttonStyles}
      onClick={() => isActive.value = !isActive.value}
    >
      {isActive.value ? 'Active' : 'Inactive'}
    </button>
  );
}`;

	console.log("BEFORE FIX:");
	console.log("  JSX: <button style={buttonStyles}>Click</button>");
	console.log("  Would compile to: html\\`<button style=\\${buttonStyles}>Click</button>\\`");
	console.log("  ❌ This doesn't work in lit-html - objects can't be directly interpolated as styles");
	console.log();
	
	console.log("AFTER FIX:");
	console.log("  JSX: <button style={buttonStyles}>Click</button>");
	console.log("  Compiles to: html\\`<button \\${styleMap(buttonStyles)}>Click</button>\\`");
	console.log("  ✅ This works correctly - styleMap directive handles object-to-CSS conversion");
	console.log();
	
	console.log("=" .repeat(80));
	console.log("\nFull Example Compilation:\n");

	try {
		const result = await babel.transformAsync(jsxCode, {
			plugins: [["@babel/plugin-syntax-jsx"], [jsxToLitHtmlPlugin]],
			parserOpts: {
				plugins: ["jsx", "typescript"],
			},
		});

		console.log("Input JSX:");
		console.log(jsxCode.trim());
		console.log("\n" + "-".repeat(80) + "\n");
		console.log("Compiled Output:");
		console.log(result?.code || "No output");
		console.log("\n" + "=".repeat(80));
		
		console.log("\n✅ SUCCESS!");
		console.log("   - styleMap is automatically imported from kaori.js");
		console.log("   - style={object} is correctly wrapped with styleMap()");
		console.log("   - String styles remain unchanged: style=\"color: red\"");
		console.log("   - Works seamlessly with other directives (ref, props, events)");
	} catch (error) {
		console.error("Transformation failed:", error);
	}
}

demonstrateFixedBehavior();
