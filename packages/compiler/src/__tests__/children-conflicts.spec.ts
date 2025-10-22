import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compile } from './utils';

describe('Conflicting children prop and content (Issue #2)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should warn when both children prop and children content exist', async () => {
    const input = `
function Test() {
  return (
    <Component children={<span>Prop children</span>}>
      <div>Content children</div>
    </Component>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });

  it('should prioritize children content over children prop', async () => {
    const input = `
function Test() {
  return (
    <Component children={<span>Prop</span>}>
      <div>Content</div>
    </Component>
  );
}`;

    const output = await compile(input);
    // Should only have content children in output
    expect(output).toContain('children: html');
    expect(output).toContain('<div>Content</div>');
  });

  it('should not warn with only children prop', async () => {
    const input = `
function Test() {
  return (
    <Component children={<span>Only prop</span>} />
  );
}`;

    const output = await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
    expect(output).toContain('children:');
  });

  it('should not warn with only children content', async () => {
    const input = `
function Test() {
  return (
    <Component>
      <div>Only content</div>
    </Component>
  );
}`;

    const output = await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
    expect(output).toContain('children:');
  });

  it('should warn with multiple children content and children prop', async () => {
    const input = `
function Test() {
  return (
    <Component children="prop">
      <div>Child 1</div>
      <div>Child 2</div>
    </Component>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });

  it('should handle children prop with function value', async () => {
    const input = `
function Test() {
  return (
    <Component children={() => <div>Function child</div>}>
      <span>Content</span>
    </Component>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });

  it('should not warn when children prop is from spread', async () => {
    const input = `
function Test() {
  const props = { children: <div>Spread</div> };
  return (
    <Component {...props} />
  );
}`;

    const output = await compile(input);
    // Spread attributes are not checked for conflicts
    expect(output).toBeTruthy();
  });

  it('should handle text children with children prop', async () => {
    const input = `
function Test() {
  return (
    <Component children={<div>Prop</div>}>
      Text content here
    </Component>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });

  it('should handle expression children with children prop', async () => {
    const input = `
function Test() {
  const value = "test";
  return (
    <Component children={<div>Prop</div>}>
      {value}
    </Component>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });

  it('should not affect components without children at all', async () => {
    const input = `
function Test() {
  return (
    <Component name="test" value={123} />
  );
}`;

    const output = await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
    expect(output).not.toContain('children');
  });

  it('should handle nested components with children conflicts', async () => {
    const input = `
function Test() {
  return (
    <Parent>
      <Child children={<span>Prop</span>}>
        <div>Content</div>
      </Child>
    </Parent>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });
});
