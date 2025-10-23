import { describe, it, expect } from 'vitest';
import { compile } from './utils';

describe('Spread Props', () => {
  describe('HTML Elements', () => {
    it('should handle spread on HTML element', async () => {
      const input = `
function Button() {
  const props = { class: "btn", id: "button1" };
  return <button {...props}>Click me</button>;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('spread');
      expect(output).toContain('html`');
    });

    it('should handle multiple spreads on HTML element', async () => {
      const input = `
function Button() {
  const baseProps = { class: "btn" };
  const extraProps = { id: "button1" };
  return <button {...baseProps} {...extraProps}>Click me</button>;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('spread(baseProps)');
      expect(output).toContain('spread(extraProps)');
    });

    it('should handle spread mixed with regular attributes on HTML element', async () => {
      const input = `
function Button() {
  const props = { class: "btn" };
  return <button {...props} onClick={() => {}} disabled>Click me</button>;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('spread(props)');
    });

    it('should handle spread before and after attributes on HTML element', async () => {
      const input = `
function Input() {
  const props1 = { class: "input" };
  const props2 = { id: "field1" };
  return <input type="text" {...props1} placeholder="Enter text" {...props2} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('spread(props1)');
      expect(output).toContain('spread(props2)');
    });

    it('should handle self-closing HTML element with spread', async () => {
      const input = `
function Image() {
  const imgProps = { src: "/logo.png", alt: "Logo" };
  return <img {...imgProps} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('spread(imgProps)');
    });
  });

  describe('Components', () => {
    it('should optimize single spread with no other props', async () => {
      const input = `
function Wrapper() {
  const props = { value: "test" };
  return <Component {...props} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('component(Component, props)');
      expect(output).not.toContain('mergeProps');
    });

    it('should use mergeProps for single spread with other props', async () => {
      const input = `
function Wrapper() {
  const props = { value: "test" };
  return <Component {...props} other="value" />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('props');
      expect(output).toContain('other');
    });

    it('should use mergeProps for multiple spreads', async () => {
      const input = `
function Wrapper() {
  const props1 = { value: "test" };
  const props2 = { id: "field1" };
  return <Component {...props1} {...props2} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps(props1, props2)');
    });

    it('should use mergeProps for spreads with multiple other props', async () => {
      const input = `
function Wrapper() {
  const props = { value: "test" };
  const moreProps = { id: "field1" };
  return <Component {...props} {...moreProps} other="a" something="b" />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('props');
      expect(output).toContain('moreProps');
      expect(output).toContain('other');
      expect(output).toContain('something');
    });

    it('should handle spread before attributes', async () => {
      const input = `
function Wrapper() {
  const baseProps = { class: "base" };
  return <Component {...baseProps} value={getValue()} onClick={handleClick} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('baseProps');
    });

    it('should handle spread after attributes', async () => {
      const input = `
function Wrapper() {
  const overrides = { class: "override" };
  return <Component value={getValue()} onClick={handleClick} {...overrides} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('overrides');
    });

    it('should handle spread in the middle of attributes', async () => {
      const input = `
function Wrapper() {
  const middleProps = { value: "middle" };
  return <Component first="a" {...middleProps} last="z" />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('first');
      expect(output).toContain('middleProps');
      expect(output).toContain('last');
    });

    it('should handle complex spread scenario with reactive props', async () => {
      const input = `
function Complex() {
  const props = { value: "test" };
  return <Component {...props} onClick={() => {}} data={getData()} count={state.count} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('onClick: () => {}');
      expect(output).toContain('get data()');
      expect(output).toContain('get count()');
    });

    it('should handle spread with namespaced attributes', async () => {
      const input = `
function Input() {
  const props = { value: "test" };
  return <Input {...props} prop:value={getValue()} bind:checked={state.checked} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('["prop:value"]');
      expect(output).toContain('["bind:checked"]');
    });

    it('should handle spread with data attributes', async () => {
      const input = `
function Component() {
  const props = { value: "test" };
  return <Input {...props} data-test-id="input1" aria-label="Field" />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('data-test-id');
      expect(output).toContain('aria-label');
    });

    it('should not optimize single spread when component has children', async () => {
      const input = `
function Wrapper() {
  const props = { value: "test" };
  return <Component {...props}><span>Child</span></Component>;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('children');
    });

    it('should handle spread with children content', async () => {
      const input = `
function Wrapper() {
  const props = { value: "test" };
  return (
    <Component {...props} other="value">
      <div>Child 1</div>
      <div>Child 2</div>
    </Component>
  );
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
      expect(output).toContain('children');
    });
  });

  describe('Mixed Scenarios', () => {
    it('should handle spreads on both HTML elements and components', async () => {
      const input = `
function Mixed() {
  const buttonProps = { class: "btn" };
  const componentProps = { value: "test" };
  return (
    <div>
      <button {...buttonProps}>Click</button>
      <Component {...componentProps} />
    </div>
  );
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('spread(buttonProps)');
      expect(output).toContain('component(Component, componentProps)');
    });

    it('should handle nested components with spreads', async () => {
      const input = `
function Nested() {
  const outerProps = { class: "outer" };
  const innerProps = { value: "inner" };
  return (
    <Outer {...outerProps}>
      <Inner {...innerProps} />
    </Outer>
  );
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
    });

    it('should handle fragment with multiple spreads', async () => {
      const input = `
function Fragment() {
  const props1 = { value: "a" };
  const props2 = { value: "b" };
  return (
    <>
      <Component1 {...props1} />
      <Component2 {...props2} other="value" />
    </>
  );
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('component(Component1, props1)');
      expect(output).toContain('mergeProps(props2');
    });

    it('should handle complex real-world example', async () => {
      const input = `
function Button(props) {
  return () => {
    <>
      <Input thing={props.value} prop:value={props.value} data-thing="asd" />
      <Button {...props} onClick={() => {}} {...somethingElse}></Button>
      <button {...props}></button>
    </>
  }
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      // Button component should use mergeProps
      expect(output).toContain('mergeProps');
      // button HTML element should use spread
      expect(output).toContain('spread(props)');
    });

    it('should handle expression spreads', async () => {
      const input = `
function Dynamic() {
  const getProps = () => ({ value: "test" });
  return <Component {...getProps()} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('component(Component, getProps())');
    });

    it('should handle member expression spreads', async () => {
      const input = `
function Member() {
  const obj = { props: { value: "test" } };
  return <Component {...obj.props} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('component(Component, obj.props)');
    });

    it('should handle conditional expression spreads', async () => {
      const input = `
function Conditional() {
  const props1 = { value: "a" };
  const props2 = { value: "b" };
  const condition = true;
  return <Component {...(condition ? props1 : props2)} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('condition ? props1 : props2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty spread object', async () => {
      const input = `
function Empty() {
  return <Component {...{}} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
    });

    it('should handle spread with inline object', async () => {
      const input = `
function Inline() {
  return <Component {...{ value: "test", other: 123 }} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
    });

    it('should handle multiple consecutive spreads', async () => {
      const input = `
function Multiple() {
  return <Component {...props1} {...props2} {...props3} {...props4} />;
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps(props1, props2, props3, props4)');
    });

    it('should handle spread with all attribute types', async () => {
      const input = `
function AllTypes() {
  const props = { base: "value" };
  return (
    <Component
      {...props}
      onClick={handleClick}
      prop:value={getValue()}
      bool:disabled={isDisabled()}
      data-test="test"
      aria-label="Label"
      ref={ref}
    />
  );
}`;

      const output = await compile(input);
      expect(output).toMatchSnapshot();
      expect(output).toContain('mergeProps');
    });
  });
});
