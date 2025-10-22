import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { compile } from './utils';

describe('Conflicting class and classMap attributes (Issue #3)', () => {
  beforeEach(() => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should warn when both class and classMap exist', async () => {
    const input = `
function Test() {
  const classes = { active: true, disabled: false };
  return (
    <div class="static-class" classMap={classes}>
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should warn when both className and classMap exist', async () => {
    const input = `
function Test() {
  const classes = { active: true };
  return (
    <div className="static-class" classMap={classes}>
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should not warn with only class attribute', async () => {
    const input = `
function Test() {
  return (
    <div class="only-class">Content</div>
  );
}`;

    await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should not warn with only className attribute', async () => {
    const input = `
function Test() {
  return (
    <div className="only-classname">Content</div>
  );
}`;

    await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should not warn with only classMap attribute', async () => {
    const input = `
function Test() {
  const classes = { active: true };
  return (
    <div classMap={classes}>Content</div>
  );
}`;

    await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should still compile both attributes despite warning', async () => {
    const input = `
function Test() {
  const classes = { active: true };
  return (
    <div class="base" classMap={classes}>
      Content
    </div>
  );
}`;

    const output = await compile(input);
    // Both should be in output (non-breaking)
    expect(output).toContain('class=');
    expect(output).toContain('classMap');
    expect(console.warn).toHaveBeenCalled();
  });

  it('should warn on components with class and classMap', async () => {
    const input = `
function Test() {
  const classes = { highlight: true };
  return (
    <Component class="base" classMap={classes} />
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should handle dynamic class values', async () => {
    const input = `
function Test() {
  const dynamicClass = getClass();
  const classes = { active: true };
  return (
    <div class={dynamicClass} classMap={classes}>
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should handle nested elements with conflicts', async () => {
    const input = `
function Test() {
  const classes = { active: true };
  return (
    <span class="outer" classMap={classes}>
      Outer
    </span>
  );
}`;

    const output = await compile(input);
    // Should warn for element with conflict
    expect(console.warn).toHaveBeenCalled();
    expect(output).toContain('class=');
    expect(output).toContain('classMap');
  });

  it('should not warn when only className exists (no classMap)', async () => {
    const input = `
function Test() {
  return (
    <div className="test">
      <span className="nested">Content</span>
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should handle classMap with object expression', async () => {
    const input = `
function Test() {
  return (
    <div class="static" classMap={{ active: true, disabled: false }}>
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should handle classMap with identifier', async () => {
    const input = `
function Test() {
  const myClasses = { active: true };
  return (
    <div class="base" classMap={myClasses}>
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should handle classMap with function call', async () => {
    const input = `
function Test() {
  return (
    <div class="base" classMap={getClasses()}>
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
  });

  it('should not affect elements without any class attributes', async () => {
    const input = `
function Test() {
  return (
    <div id="test" data-value="123">
      Content
    </div>
  );
}`;

    await compile(input);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should handle multiple conflicts in same component', async () => {
    const input = `
function Test() {
  const classes = { active: true };
  return (
    <Component
      class="base"
      classMap={classes}
      children={<div>Prop</div>}
    >
      <span>Content</span>
    </Component>
  );
}`;

    await compile(input);
    // Should warn for both class conflict AND children conflict
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'class' and 'classMap' attributes")
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("both 'children' prop and children content")
    );
  });
});
