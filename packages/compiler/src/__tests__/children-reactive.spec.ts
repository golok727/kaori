import { describe, it, expect } from 'vitest';
import { compile } from './utils';

describe('Children prop reactivity', () => {
  it('should make children reactive when containing function calls', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      {getMessage()}
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get children()');
    expect(output).toContain('return getMessage()');
    expect(output).toMatchSnapshot();
  });

  it('should make children reactive when containing member access', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      {user.name}
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get children()');
    expect(output).toContain('user.name');
    expect(output).toMatchSnapshot();
  });

  it('should make children reactive when containing component with function call props', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      <Child title={getTitle()} />
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get children()');
    expect(output).toMatchSnapshot();
  });

  it('should make children reactive when containing html template with member access', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      <p>{user.name}</p>
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get children()');
    expect(output).toMatchSnapshot();
  });

  it('should NOT make children reactive when containing only static content', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      <p>Static text</p>
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).not.toContain('get children()');
    expect(output).toContain('children: html');
    expect(output).toMatchSnapshot();
  });

  it('should make children reactive even with static component props (component call is dynamic)', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      <Child title="static" />
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get children()');
    expect(output).toContain('component(Child');
    expect(output).toMatchSnapshot();
  });

  it('should make children reactive with mixed static and dynamic content', async () => {
    const input = `
function Parent() {
  return (
    <Container>
      <p>Static</p>
      {getDynamic()}
      <Child prop={getValue()} />
    </Container>
  );
}`;

    const output = await compile(input);
    expect(output).toContain('get children()');
    expect(output).toMatchSnapshot();
  });

  it('should NOT make arrow function children reactive (functions are static)', async () => {
    const input = `
function Parent() {
  return (
    <For items={getItems()}>
      {item => <div>{item.name}</div>}
    </For>
  );
}`;

    const output = await compile(input);
    // Arrow functions are static values - no getter needed
    expect(output).not.toContain('get children()');
    expect(output).toContain('children: item =>');
    expect(output).toContain('item.name');
    expect(output).toMatchSnapshot();
  });

  it('should handle nested reactive children correctly', async () => {
    const input = `
function Parent() {
  return (
    <Outer>
      <Middle>
        <Inner prop={getValue()} />
      </Middle>
    </Outer>
  );
}`;

    const output = await compile(input);
    expect(output).toMatchSnapshot();
  });
});
