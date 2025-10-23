import { describe, it, expect } from 'vitest';
import { compile } from './utils';

describe('JSX to lit-html transformation', () => {
  it('should transform basic nested elements', async () => {
    const input = `
function Basic() {
  return (
    <div className="container">
      <header>
        <h1>Title</h1>
        <nav>
          <a href="/home">Home</a>
          <a href="/about">About</a>
        </nav>
      </header>
      <main>
        <p>Content here</p>
      </main>
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform mixed children (text, expressions, elements)', async () => {
    const input = `
function MixedChildren() {
  const name = "World";
  const count = 42;
  return (
    <div>
      Hello {name}!
      <span>Count: {count}</span>
      Some more text
      <p>Paragraph</p>
      Final text
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform components with children', async () => {
    const input = `
function ComponentChildren() {
  return (
    <Layout>
      <Header title="My App" />
      <Content>
        <Article title={getTitle()}>
          <p>Article content</p>
          <Comments comments={getComments()} />
        </Article>
      </Content>
      <Footer />
    </Layout>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform fragments', async () => {
    const input = `
function FragmentTest() {
  return (
    <>
      <h1>Title</h1>
      <p>Paragraph 1</p>
      <p>Paragraph 2</p>
    </>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform complex nesting with all attribute types', async () => {
    const input = `
function ComplexNesting() {
  return (
    <div className="outer">
      <input
        type="text"
        prop:value={getValue()}
        bool:disabled={isDisabled()}
        onChange={handleChange}
      />
      <Show when={showContent()}>
        <div className="inner">
          <For items={items()}>
            {(item) => (
              <Card key={item.id}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <button onClick={() => handleClick(item.id)}>
                  {item.completed ? "Undo" : "Complete"}
                </button>
              </Card>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform self-closing elements', async () => {
    const input = `
function SelfClosing() {
  return (
    <div>
      <img src="/logo.png" alt="Logo" />
      <input type="text" prop:value={text()} />
      <br />
      <hr className="divider" />
      <meta name="description" content="Test" />
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should transform empty children and whitespace', async () => {
    const input = `
function EmptyChildren() {
  return (
    <div>
      <Empty />

      <WithChildren>

      </WithChildren>

      <p></p>
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should handle import thing', async () => {
    const input = `
function ImportThing() {
return <div><ImportThing/></div>;
}
`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should handle getter wrapping for complex expressions', async () => {
    const input = `
function GetterWrapping() {
  const count = { value: 5 };
  return (
    <div>
      <Component when={count.value > 10} />
      <Component count={count.value} />
      <Component onClick={handleClick} />
      <Component data={getData()} />
      <Component isActive={user.isLoggedIn && user.role === 'admin'} />
      <Component simple="static string" />
      <Component number={42} />
      <Component condition={a > b && c.value < d.getValue()} />
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });

  it('should handle component props with colons (namespaced attributes)', async () => {
    const input = `
function NamespacedProps(props) {
  return (
    <Input
      prop:value={props.value}
      prop:checked={props.checked}
      bind:value={state.value}
    />
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain('get ["prop:value"]()');
    expect(output).toContain('get ["prop:checked"]()');
    expect(output).toContain('get ["bind:value"]()');
  });

  it('should handle component props with hyphens (data attributes)', async () => {
    const input = `
function DataAttributes(props) {
  return (
    <Input
      data-thing="asd"
      data-value={props.value}
      aria-label="Input field"
      custom-attr={getValue()}
    />
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain('"data-thing": "asd"');
    expect(output).toContain('get ["data-value"]()');
    expect(output).toContain('"aria-label": "Input field"');
    expect(output).toContain('get ["custom-attr"]()');
  });

  it('should handle mixed valid and invalid identifier props', async () => {
    const input = `
function MixedProps(props) {
  return (
    <Input
      thing={props.value}
      prop:value={props.value}
      data-thing="asd"
      validName={props.name}
      another-invalid={getStuff()}
    />
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
    expect(output).toContain('get thing()');
    expect(output).toContain('get ["prop:value"]()');
    expect(output).toContain('"data-thing": "asd"');
    expect(output).toContain('get validName()');
    expect(output).toContain('get ["another-invalid"]()');
  });

  it('should handle HTML elements with invalid identifier attributes', async () => {
    const input = `
function HtmlWithDataAttrs() {
  return (
    <div
      data-test-id="container"
      data-value={getValue()}
      aria-label="Main container"
      className="box"
    >
      <input data-input="text" type="text" />
    </div>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });
});
