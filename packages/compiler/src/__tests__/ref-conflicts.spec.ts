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

describe("Ref directive with naming conflicts", () => {
  it("should handle simple ref variable conflict", async () => {
    const input = `
function App() {
  const ref = "I'm a variable named ref";
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref as function name", async () => {
    const input = `
function App() {
  function ref(element) {
    console.log("Custom ref function", element);
  }

  const divRef = createRef();
  return <div ref={divRef}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref1 also conflicts (should use ref2)", async () => {
    const input = `
function App() {
  const ref = "original";
  const ref1 = "also taken";
  const myRef = createRef();
  return <div ref={myRef}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle multiple conflicts (ref, ref1, ref2 all taken)", async () => {
    const input = `
function App() {
  const ref = "taken";
  const ref1 = "also taken";
  const ref2 = "still taken";
  const myRef = createRef();
  return <div ref={myRef}>Content</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref as parameter name", async () => {
    const input = `
function App({ ref }) {
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref in destructuring", async () => {
    const input = `
function App() {
  const { ref } = props;
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref as class property", async () => {
    const input = `
class App {
  ref = "class property";

  render() {
    const myRef = createRef();
    return <div ref={myRef}>{this.ref}</div>;
  }
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref in nested scope", async () => {
    const input = `
function App() {
  const myRef = createRef();

  function innerFunc() {
    const ref = "inner scope";
    return ref;
  }

  return <div ref={myRef}>{innerFunc()}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref imported from different package", async () => {
    const input = `
import { ref } from "some-other-package";

function App() {
  const myRef = createRef();
  const otherRef = ref();
  return <div ref={myRef}>{otherRef}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle multiple import conflicts", async () => {
    const input = `
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

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle arrow function with ref parameter", async () => {
    const input = `
const App = ({ ref }) => {
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
};`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref as const in upper scope", async () => {
    const input = `
const ref = "global ref";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>{ref}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle multiple elements with refs and conflict", async () => {
    const input = `
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

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle ref in object property", async () => {
    const input = `
function App() {
  const config = { ref: "property" };
  const myRef = createRef();
  return <div ref={myRef}>{config.ref}</div>;
}`;

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });

  it("should handle complex scenario with all types of conflicts", async () => {
    const input = `
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

    const output = await transformJSX(input);
    expect(output).toMatchSnapshot();
  });
});
