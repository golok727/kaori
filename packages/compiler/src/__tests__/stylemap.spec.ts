import { describe, it, expect } from "vitest";
import babel from "@babel/core";
import { KaoriCompiler } from "../babel-plugin.js";

async function transformJSX(jsxCode: string) {
  const result = await babel.transformAsync(jsxCode, {
    plugins: [["@babel/plugin-syntax-jsx"], [KaoriCompiler]],
    parserOpts: {
      plugins: ["jsx", "typescript"],
    },
  });
  return result?.code || "";
}

describe("styleMap transformation", () => {
  it("should wrap style with object variable in styleMap", async () => {
    const input = `
function TestStyle() {
  const styles = { color: 'red', fontSize: '20px' };
  return <div style={styles}>Hello</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap(styles)}");
    expect(output).toContain('import { html, styleMap } from "kaori.js"');
  });

  it("should wrap inline style object in styleMap", async () => {
    const input = `
function TestInlineStyle() {
  return <div style={{ color: 'blue', margin: '10px' }}>Hello</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap({");
    expect(output).toContain('import { html, styleMap } from "kaori.js"');
  });

  it("should not wrap string style attributes", async () => {
    const input = `
function TestStringStyle() {
  return <div style="color: green;">Hello</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain('style="color: green;"');
    expect(output).not.toContain("styleMap");
  });

  it("should wrap style with function call in styleMap", async () => {
    const input = `
function TestComplexStyle() {
  function getStyles() {
    return { color: 'red', fontSize: '16px' };
  }
  return <div style={getStyles()}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap(getStyles())}");
  });

  it("should wrap style with member expression in styleMap", async () => {
    const input = `
function TestMemberStyle() {
  const theme = {
    primary: { color: 'blue' }
  };
  return <div style={theme.primary}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap(theme.primary)}");
  });

  it("should wrap style with conditional expression in styleMap", async () => {
    const input = `
function TestConditionalStyle() {
  const isActive = true;
  const activeStyles = { color: 'blue' };
  const inactiveStyles = { color: 'gray' };
  return <div style={isActive ? activeStyles : inactiveStyles}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain(
      "style=${styleMap(isActive ? activeStyles : inactiveStyles)}",
    );
  });

  it("should wrap style with logical expression in styleMap", async () => {
    const input = `
function TestLogicalStyle() {
  const showStyles = true;
  const styles = { color: 'red' };
  return <div style={showStyles && styles}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap(showStyles && styles)}");
  });

  it("should handle style with spread operator", async () => {
    const input = `
function TestSpreadStyle() {
  const baseStyles = { padding: '10px' };
  return <div style={{ ...baseStyles, color: 'red' }}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap({");
    expect(output).toContain("...baseStyles");
  });

  it("should work with existing styleMap import", async () => {
    const input = `
import { html, styleMap } from "kaori.js";

function App() {
  const styles = { color: 'red' };
  return <div style={styles}>Hello</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap(styles)}");
  });

  it("should handle styleMap variable conflict", async () => {
    const input = `
function App() {
  const styleMap = "I'm a variable named styleMap";
  const styles = { color: 'red' };
  return <div style={styles}>{styleMap}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("styleMap1(styles)");
    expect(output).toContain(
      'import { html, styleMap as styleMap1 } from "kaori.js"',
    );
  });

  it("should work with aliased styleMap import", async () => {
    const input = `
import { styleMap as sm } from "kaori.js";

function App() {
  const styles = { color: 'red' };
  return <div style={styles}>Hello</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${sm(styles)}");
  });

  it("should work with style and other directives", async () => {
    const input = `
import { createRef } from "kaori.js";

function App() {
  const divRef = createRef();
  const styles = { color: 'red', padding: '10px' };
  return <div ref={divRef} style={styles}>Hello</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("${ref(divRef)} style=${styleMap(styles)}");
  });

  it("should handle multiple elements with styles", async () => {
    const input = `
function App() {
  const headerStyles = { fontSize: '24px' };
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

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain("style=${styleMap(headerStyles)}");
    expect(output).toContain("style=${styleMap(contentStyles)}");
    expect(output).toContain("style=${styleMap({");
  });
});
