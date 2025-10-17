import { describe, it, expect } from 'vitest';
import { compile } from './utils';

describe('Ref directive transformation', () => {
  it('should transform basic ref usage', async () => {
    const input = `
import { createRef } from "kaori.js";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref with existing ref import', async () => {
    const input = `
import { ref, createRef, html } from "kaori.js";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref with conflicting name', async () => {
    const input = `
function App() {
  const ref = "some variable";
  const myRef = createRef();
  return <div ref={myRef}>Hello {ref}</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform multiple refs in one component', async () => {
    const input = `
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

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref with other attributes', async () => {
    const input = `
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

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref in nested elements', async () => {
    const input = `
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

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref with dynamic expression', async () => {
    const input = `
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

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref with inline createRef', async () => {
    const input = `
import { createRef } from "kaori.js";

function App() {
  return <div ref={createRef()}>Inline ref</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref on component', async () => {
    const input = `
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

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform self-closing element with ref', async () => {
    const input = `
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

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform ref with path import', async () => {
    const input = `
import { createRef, html, component } from "/@fs/C:/Users/Radha/dev/frameworks/kaori/packages/kaori/src/index.ts";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform aliased ref import', async () => {
    const input = `
import { ref as litRef, createRef } from "kaori.js";

function App() {
  const myRef = createRef();
  return <div ref={myRef}>Hello</div>;
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });
});
