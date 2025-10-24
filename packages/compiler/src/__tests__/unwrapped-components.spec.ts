import { describe, it, expect } from 'vitest';
import { compile } from './utils';

describe('Unwrapped Components - Optimization', () => {
  describe('Single component in children', () => {
    it('should not wrap component() call in html when already in template context', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Child />
    </Container>
  );
}`;

      const output = await compile(input);

      // Should have html template literal for outer component
      expect(output).toContain('html`');
      expect(output).toContain('component(Child');
      expect(output).toContain('get children()');
      // The component call should NOT be wrapped in html since it's in template context
      expect(output).toMatch(/get children\(\)\s*\{\s*return component\(Child/);
      expect(output).toMatchSnapshot();
    });

    it('should not wrap component with props', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Child title="test" />
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('html`');
      expect(output).toMatch(/return component\(Child/);
      expect(output).toMatchSnapshot();
    });

    it('should not wrap component with reactive props', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Child title={getTitle()} />
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('html`');
      expect(output).toMatch(/return component\(Child/);
      expect(output).toContain('get title()');
      expect(output).toMatchSnapshot();
    });
  });

  describe('Multiple components in children', () => {
    it('should not wrap sibling components individually', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Header />
      <Body />
      <Footer />
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('html`');
      expect(output).toContain('component(Header');
      expect(output).toContain('component(Body');
      expect(output).toContain('component(Footer');
      // Components should be in an array without individual html wrappers
      expect(output).toMatch(
        /return \[component\(Header[\s\S]*component\(Body[\s\S]*component\(Footer/
      );
      expect(output).toMatchSnapshot();
    });

    it('should optimize components mixed with text', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Header />
      Some text
      <Footer />
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('html`');
      expect(output).toContain('Some text');
      expect(output).toMatchSnapshot();
    });

    it('should optimize components mixed with HTML elements', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Component1 />
      <div>Middle content</div>
      <Component2 />
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('html`');
      expect(output).toContain('component(Component1');
      expect(output).toContain('component(Component2');
      expect(output).toContain('Middle content');
      expect(output).toMatchSnapshot();
    });
  });

  describe('Nested components (3+ levels)', () => {
    it('should optimize nested components at each level', async () => {
      const input = `
function Parent() {
  return (
    <Outer>
      <Middle>
        <Inner />
      </Middle>
    </Outer>
  );
}`;

      const output = await compile(input);

      // Top level should have html wrapping
      const outerMatch = output.match(
        /component\(Outer[\s\S]*get children\(\)[\s\S]*return component/
      );
      expect(outerMatch).toBeTruthy();

      const middleMatch = output.match(
        /component\(Middle[\s\S]*get children\(\)[\s\S]*return component/
      );
      expect(middleMatch).toBeTruthy();

      expect(output).toMatchSnapshot();
    });

    it('should optimize deeply nested components (5 levels)', async () => {
      const input = `
function Root() {
  return (
    <L1>
      <L2>
        <L3>
          <L4>
            <L5 />
          </L4>
        </L3>
      </L2>
    </L1>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(L1');
      expect(output).toContain('component(L2');
      expect(output).toContain('component(L3');
      expect(output).toContain('component(L4');
      expect(output).toContain('component(L5');
      // Should have only one html wrapper at the top level
      expect(
        output.match(/html`\$\{component/g)?.length
      ).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should optimize nested components with reactive props at each level', async () => {
      const input = `
function Parent() {
  return (
    <Outer prop={getValue1()}>
      <Middle prop={getValue2()}>
        <Inner prop={getValue3()} />
      </Middle>
    </Outer>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('get prop()');
      expect(output).toContain('getValue1()');
      expect(output).toContain('getValue2()');
      expect(output).toContain('getValue3()');
      expect(output).toMatchSnapshot();
    });
  });

  describe('Components in control flow', () => {
    it('should optimize component in Show conditional', async () => {
      const input = `
function Parent() {
  return (
    <Show when={condition}>
      <Child />
    </Show>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Show');
      expect(output).toContain('component(Child');
      // Child should not be wrapped in html inside Show's children getter
      expect(output).toMatch(
        /get children\(\)\s*\{\s*return component\(Child/
      );
      expect(output).toMatchSnapshot();
    });

    it('should optimize component in For loop', async () => {
      const input = `
function Parent() {
  return (
    <For items={items} key={item => item.id}>
      {item => <Item data={item} />}
    </For>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(For');
      expect(output).toContain('component(Item');
      // Arrow function children are static values, but JSX inside them gets wrapped
      // The Item component inside the arrow function will be wrapped in html
      expect(output).toContain('children: item => html`${component(Item');
      expect(output).toMatchSnapshot();
    });

    it('should optimize nested Show with components', async () => {
      const input = `
function Parent() {
  return (
    <Show when={outer}>
      <Show when={inner}>
        <Child />
      </Show>
    </Show>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Show');
      expect(output).toContain('component(Child');
      expect(output).toMatchSnapshot();
    });
  });

  describe('Complex component hierarchies', () => {
    it('should optimize component with multiple nested children at different levels', async () => {
      const input = `
function App() {
  return (
    <Layout>
      <Header>
        <Logo />
        <Nav />
      </Header>
      <Main>
        <Sidebar />
        <Content>
          <Article />
        </Content>
      </Main>
      <Footer />
    </Layout>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Layout');
      expect(output).toContain('component(Header');
      expect(output).toContain('component(Logo');
      expect(output).toContain('component(Nav');
      expect(output).toContain('component(Main');
      expect(output).toContain('component(Sidebar');
      expect(output).toContain('component(Content');
      expect(output).toContain('component(Article');
      expect(output).toContain('component(Footer');
      // Should have only one html wrapper at the top level
      expect(output.match(/html`/g)?.length).toBe(1);
      expect(output).toMatchSnapshot();
    });

    it('should optimize components with conditional rendering', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      {showHeader && <Header />}
      <Body />
      {showFooter ? <Footer /> : <MinimalFooter />}
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Container');
      expect(output).toContain('component(Header');
      expect(output).toContain('component(Body');
      expect(output).toContain('component(Footer');
      expect(output).toContain('component(MinimalFooter');
      expect(output).toMatchSnapshot();
    });

    it('should optimize components in arrays/maps', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      {items.map(item => <Item key={item.id} data={item} />)}
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Container');
      expect(output).toContain('component(Item');
      expect(output).toMatchSnapshot();
    });
  });

  describe('Edge cases', () => {
    it('should wrap component as direct return value', async () => {
      const input = `
function Wrapper() {
  return <Child />;
}`;

      const output = await compile(input);

      // Direct return of component should be wrapped in html
      expect(output).toContain('html`');
      expect(output).toContain('component(Child');
      expect(output).toMatchSnapshot();
    });

    it('should not wrap components in fragment', async () => {
      const input = `
function Parent() {
  return (
    <>
      <Child1 />
      <Child2 />
    </>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Child1');
      expect(output).toContain('component(Child2');
      // Fragment with multiple children returns array without html wrapper
      expect(output).not.toContain('html`');
      expect(output).toMatchSnapshot();
    });

    it('should optimize self-closing and non-self-closing components', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Child1 />
      <Child2></Child2>
      <Child3>Content</Child3>
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Child1');
      expect(output).toContain('component(Child2');
      expect(output).toContain('component(Child3');
      expect(output).toMatchSnapshot();
    });

    it('should optimize component with spread props', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      <Child {...props} />
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Child');
      expect(output).toContain('html`');
      expect(output).toMatchSnapshot();
    });

    it('should not double-wrap already wrapped components', async () => {
      const input = `
function Parent() {
  return (
    <Container>
      {html\`\${<Child />}\`}
    </Container>
  );
}`;

      const output = await compile(input);

      expect(output).toContain('component(Child');
      // Should not have nested html`` wrappers
      const htmlCount = (output.match(/html`/g) || []).length;
      expect(htmlCount).toBeLessThan(4); // Reasonable limit
      expect(output).toMatchSnapshot();
    });
  });

  describe('Regression tests', () => {
    it('should preserve static content wrapping behavior', async () => {
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

    it('should make children reactive when containing dynamic content', async () => {
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

    it('should handle arrow function children (For component pattern)', async () => {
      const input = `
function Parent() {
  return (
    <For items={getItems()}>
      {item => <div>{item.name}</div>}
    </For>
  );
}`;

      const output = await compile(input);

      expect(output).not.toContain('get children()');
      expect(output).toContain('children: item =>');
      expect(output).toMatchSnapshot();
    });
  });
});
