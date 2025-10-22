import { describe, it, expect } from 'vitest';
import { compile } from './utils';

describe('Inline functions should not be wrapped in getters (Issue #1)', () => {
  it('should not wrap inline arrow function props in getters', async () => {
    const input = `
function Test() {
  return (
    <Component onClick={() => console.log("click")} />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('onClick: () =>');
    expect(output).not.toContain('get onClick()');
  });

  it('should not wrap inline function expressions in getters', async () => {
    const input = `
function Test() {
  return (
    <Component handler={function() { return true; }} />
  );
}`;

    const output = await compile(input);
    expect(output).not.toContain('get handler()');
  });

  it('should not wrap inline arrow functions as children in getters', async () => {
    const input = `
function Test() {
  return (
    <Component>
      {() => <div>Render prop</div>}
    </Component>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('children: () =>');
    expect(output).not.toContain('get children()');
  });

  it('should not wrap multiple inline functions in getters', async () => {
    const input = `
function Test() {
  return (
    <Component
      onMount={() => {}}
      onCleanup={() => {}}
      render={() => <span>test</span>}
    />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('onMount: () =>');
    expect(output).toContain('onCleanup: () =>');
    expect(output).toContain('render: () =>');
    expect(output).not.toContain('get onMount()');
    expect(output).not.toContain('get onCleanup()');
    expect(output).not.toContain('get render()');
  });

  it('should not wrap inline function that calls a signal in getters', async () => {
    const input = `
function Test() {
  const signal = () => "value";
  return (
    <Component callback={() => signal()} />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('callback: () =>');
    expect(output).not.toContain('get callback()');
  });

  it('should wrap direct signal calls in getters', async () => {
    const input = `
function Test() {
  const signal = () => "value";
  return (
    <Component value={signal()} />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get value()');
  });

  it('should wrap member access in getters', async () => {
    const input = `
function Test() {
  const obj = { property: "value" };
  return (
    <Component style={obj.property} />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get style()');
  });

  it('should not wrap static values in getters', async () => {
    const input = `
function Test() {
  const someVariable = "test";
  const functionReference = () => {};
  return (
    <Component
      name="static"
      count={123}
      enabled={true}
      data={someVariable}
      handler={functionReference}
    />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('name: "static"');
    expect(output).toContain('count: 123');
    expect(output).toContain('enabled: true');
    expect(output).toContain('data: someVariable');
    expect(output).toContain('handler: functionReference');
    expect(output).not.toContain('get name()');
    expect(output).not.toContain('get count()');
    expect(output).not.toContain('get enabled()');
    expect(output).not.toContain('get data()');
    expect(output).not.toContain('get handler()');
  });

  it('should not wrap conditional with functions in getters', async () => {
    const input = `
function Test() {
  const condition = true;
  return (
    <Component handler={condition ? () => action1() : () => action2()} />
  );
}`;

    const output = await compile(input);
    expect(output).not.toContain('get handler()');
  });

  it('should wrap conditional with calls in getters', async () => {
    const input = `
function Test() {
  const condition = true;
  return (
    <Component value={condition ? getValue() : getOther()} />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get value()');
  });

  it('should not wrap array of functions in getters', async () => {
    const input = `
function Test() {
  return (
    <Component handlers={[() => {}, () => {}, () => {}]} />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('handlers: [() =>');
    expect(output).not.toContain('get handlers()');
  });

  it('should handle mixed reactive and non-reactive props correctly', async () => {
    const input = `
function Test() {
  const signal = () => "value";
  const obj = { prop: "test" };
  return (
    <Component
      onClick={() => console.log("click")}
      value={signal()}
      data={obj.prop}
      name="static"
      render={() => <div>content</div>}
    />
  );
}`;

    const output = await compile(input);
    // Non-reactive (inline functions, static)
    expect(output).toContain('onClick: () =>');
    expect(output).toContain('name: "static"');
    expect(output).toContain('render: () =>');
    expect(output).not.toContain('get onClick()');
    expect(output).not.toContain('get name()');
    expect(output).not.toContain('get render()');

    // Reactive (calls and member access)
    expect(output).toContain('get value()');
    expect(output).toContain('get data()');
  });

  it('should handle nested arrow functions correctly', async () => {
    const input = `
function Test() {
  return (
    <Component
      middleware={(next) => (ctx) => next(ctx)}
    />
  );
}`;

    const output = await compile(input);
    expect(output).toContain('middleware: next =>');
    expect(output).not.toContain('get middleware()');
  });
});
