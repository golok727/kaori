import { describe, it, expect, vi } from 'vitest';
import { mergeProps } from '../helpers/merge-props';
import { splitProps } from '../helpers/split-props';

describe('mergeProps', () => {
  it('should merge simple objects', () => {
    const result = mergeProps({ a: 1 }, { b: 2 }, { c: 3 });
    expect(result).toEqual({ a: 1, b: 2, c: 3 });
  });

  it('should override properties from left to right', () => {
    const result = mergeProps({ a: 1 }, { a: 2 }, { a: 3 });
    expect(result).toEqual({ a: 3 });
  });

  it('should preserve getters', () => {
    let count = 0;
    const obj = {
      get value() {
        return ++count;
      },
    };

    const result = mergeProps({}, obj);

    expect(result.value).toBe(1);
    expect(result.value).toBe(2);
    expect(result.value).toBe(3);
  });

  it('should preserve setters', () => {
    let internalValue = 0;
    const obj = {
      get value() {
        return internalValue;
      },
      set value(v: number) {
        internalValue = v * 2;
      },
    };

    const result = mergeProps({}, obj);

    result.value = 5;
    expect(result.value).toBe(10);
  });

  it('should handle multiple objects with getters', () => {
    let count1 = 0;
    let count2 = 0;

    const obj1 = {
      get a() {
        return ++count1;
      },
    };

    const obj2 = {
      get b() {
        return ++count2;
      },
    };

    const result = mergeProps(obj1, obj2);

    expect(result.a).toBe(1);
    expect(result.b).toBe(1);
    expect(result.a).toBe(2);
    expect(result.b).toBe(2);
  });

  it('should handle non-object arguments', () => {
    const result = mergeProps({ a: 1 }, null, undefined, { b: 2 });
    expect(result).toEqual({ a: 1, b: 2 });
  });

  it('should handle empty arguments', () => {
    const result = mergeProps();
    expect(result).toEqual({});
  });

  it('should only copy own properties', () => {
    const proto = { inherited: 'value' };
    const obj = Object.create(proto);
    obj.own = 'own';

    const result = mergeProps({}, obj);

    expect(result.own).toBe('own');
    expect(result.inherited).toBeUndefined();
  });

  it('should preserve property descriptors with configurable/enumerable flags', () => {
    const obj = {};
    Object.defineProperty(obj, 'readonly', {
      value: 42,
      writable: false,
      enumerable: true,
      configurable: false,
    });

    const result = mergeProps({}, obj);
    const descriptor = Object.getOwnPropertyDescriptor(result, 'readonly');

    expect(descriptor?.value).toBe(42);
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
    expect(descriptor?.enumerable).toBe(true);
  });

  it('should handle functions as property values', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const result = mergeProps({ onClick: fn1 }, { onClick: fn2 });

    expect(result.onClick).toBe(fn2);
  });
});

describe('splitProps', () => {
  it('should split props into picked and omitted', () => {
    const props = { a: 1, b: 2, c: 3 };
    const [picked, omitted] = splitProps(props, ['a', 'b']);

    expect(picked).toEqual({ a: 1, b: 2 });
    expect(omitted).toEqual({ c: 3 });
  });

  it('should handle empty keys array', () => {
    const props = { a: 1, b: 2 };
    const [picked, omitted] = splitProps(props, []);

    expect(picked).toEqual({});
    expect(omitted).toEqual({ a: 1, b: 2 });
  });

  it('should handle all keys being picked', () => {
    const props = { a: 1, b: 2 };
    const [picked, omitted] = splitProps(props, ['a', 'b']);

    expect(picked).toEqual({ a: 1, b: 2 });
    expect(omitted).toEqual({});
  });

  it('should preserve getters in picked props', () => {
    let count = 0;
    const props = {
      get value() {
        return ++count;
      },
      static: 'test',
    };

    const [picked, omitted] = splitProps(props, ['value']);

    expect(picked.value).toBe(1);
    expect(picked.value).toBe(2);
    expect(omitted).toEqual({ static: 'test' });
  });

  it('should preserve getters in omitted props', () => {
    let count = 0;
    const props = {
      get value() {
        return ++count;
      },
      static: 'test',
    };

    const [picked, omitted] = splitProps(props, ['static']);

    expect(picked).toEqual({ static: 'test' });
    expect(omitted.value).toBe(1);
    expect(omitted.value).toBe(2);
  });

  it('should preserve setters', () => {
    let internalValue = 0;
    const props = {
      get value() {
        return internalValue;
      },
      set value(v: number) {
        internalValue = v * 2;
      },
      other: 'test',
    };

    const [picked, omitted] = splitProps(props, ['value']);

    picked.value = 5;
    expect(picked.value).toBe(10);
    expect(omitted).toEqual({ other: 'test' });
  });

  it('should handle non-existent keys gracefully', () => {
    const props = { a: 1, b: 2 };
    const [picked, omitted] = splitProps(props, ['a', 'c' as any]);

    expect(picked).toEqual({ a: 1 });
    expect(omitted).toEqual({ b: 2 });
  });

  it('should only split own properties', () => {
    const proto = { inherited: 'value' };
    const props = Object.create(proto);
    props.own = 'own';
    props.other = 'other';

    const [picked, omitted] = splitProps(props, ['own', 'inherited']);

    expect(picked).toEqual({ own: 'own' });
    expect(omitted).toEqual({ other: 'other' });
    expect(picked.inherited).toBeUndefined();
  });

  it('should preserve property descriptors', () => {
    const props: any = {};
    Object.defineProperty(props, 'readonly', {
      value: 42,
      writable: false,
      enumerable: true,
      configurable: false,
    });
    props.normal = 'test';

    const [picked, omitted] = splitProps(props, ['readonly']);
    const descriptor = Object.getOwnPropertyDescriptor(picked, 'readonly');

    expect(descriptor?.value).toBe(42);
    expect(descriptor?.writable).toBe(false);
    expect(descriptor?.configurable).toBe(false);
    expect(omitted).toEqual({ normal: 'test' });
  });

  it('should handle functions as property values', () => {
    const fn1 = vi.fn();
    const fn2 = vi.fn();

    const props = { onClick: fn1, onHover: fn2 };
    const [picked, omitted] = splitProps(props, ['onClick']);

    expect(picked.onClick).toBe(fn1);
    expect(omitted.onHover).toBe(fn2);
  });

  it('should work with complex objects', () => {
    const props = {
      id: '123',
      name: 'Test',
      onClick: vi.fn(),
      className: 'foo',
      style: { color: 'red' },
      data: { nested: true },
    };

    const [picked, omitted] = splitProps(props, ['id', 'name', 'onClick']);

    expect(picked).toEqual({
      id: '123',
      name: 'Test',
      onClick: props.onClick,
    });
    expect(omitted).toEqual({
      className: 'foo',
      style: { color: 'red' },
      data: { nested: true },
    });
  });
});

describe('mergeProps - getter function calls', () => {
  it('should call getter function each time when accessed after merge', () => {
    const getterFn = vi.fn(() => 42);
    const obj = {
      get count() {
        return getterFn();
      },
    };

    const result = mergeProps({}, obj);

    expect(getterFn).not.toHaveBeenCalled();

    result.count;
    expect(getterFn).toHaveBeenCalledTimes(1);

    result.count;
    expect(getterFn).toHaveBeenCalledTimes(2);

    result.count;
    expect(getterFn).toHaveBeenCalledTimes(3);
  });

  it('should preserve getter with incrementing value', () => {
    const getterFn = vi.fn();
    let value = 0;
    getterFn.mockImplementation(() => ++value);

    const obj = {
      get count() {
        return getterFn();
      },
    };

    const result = mergeProps({ other: 'prop' }, obj);

    expect(result.count).toBe(1);
    expect(getterFn).toHaveBeenCalledTimes(1);

    expect(result.count).toBe(2);
    expect(getterFn).toHaveBeenCalledTimes(2);

    expect(result.count).toBe(3);
    expect(getterFn).toHaveBeenCalledTimes(3);
  });

  it('should preserve multiple getters independently', () => {
    const getter1 = vi.fn(() => 'a');
    const getter2 = vi.fn(() => 'b');

    const obj1 = {
      get prop1() {
        return getter1();
      },
    };

    const obj2 = {
      get prop2() {
        return getter2();
      },
    };

    const result = mergeProps(obj1, obj2);

    expect(result.prop1).toBe('a');
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).not.toHaveBeenCalled();

    expect(result.prop2).toBe('b');
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).toHaveBeenCalledTimes(1);

    expect(result.prop1).toBe('a');
    expect(getter1).toHaveBeenCalledTimes(2);
  });

  it('should preserve getter with context/this binding', () => {
    const getterFn = vi.fn(function (this: any) {
      return this.value * 2;
    });

    const obj = {
      value: 10,
      get doubled() {
        return getterFn.call(this);
      },
    };

    const result = mergeProps({}, obj);

    expect(result.doubled).toBe(20);
    expect(getterFn).toHaveBeenCalledTimes(1);
  });
});

describe('splitProps - getter function calls', () => {
  it('should preserve getter in picked props and call it on access', () => {
    const getterFn = vi.fn(() => 42);
    const props = {
      get count() {
        return getterFn();
      },
      other: 'value',
    };

    const [picked, omitted] = splitProps(props, ['count']);

    expect(getterFn).not.toHaveBeenCalled();

    expect(picked.count).toBe(42);
    expect(getterFn).toHaveBeenCalledTimes(1);

    expect(picked.count).toBe(42);
    expect(getterFn).toHaveBeenCalledTimes(2);

    expect(omitted).toEqual({ other: 'value' });
  });

  it('should preserve getter in omitted props and call it on access', () => {
    const getterFn = vi.fn(() => 100);
    const props = {
      static: 'test',
      get count() {
        return getterFn();
      },
    };

    const [picked, omitted] = splitProps(props, ['static']);

    expect(picked).toEqual({ static: 'test' });
    expect(getterFn).not.toHaveBeenCalled();

    expect(omitted.count).toBe(100);
    expect(getterFn).toHaveBeenCalledTimes(1);

    expect(omitted.count).toBe(100);
    expect(getterFn).toHaveBeenCalledTimes(2);
  });

  it('should preserve getter with incrementing value after split', () => {
    const getterFn = vi.fn();
    let value = 0;
    getterFn.mockImplementation(() => ++value);

    const props = {
      get count() {
        return getterFn();
      },
      name: 'test',
    };

    const [picked] = splitProps(props, ['count']);

    expect(picked.count).toBe(1);
    expect(picked.count).toBe(2);
    expect(picked.count).toBe(3);
    expect(getterFn).toHaveBeenCalledTimes(3);
  });

  it('should split getters across picked and omitted', () => {
    const getter1 = vi.fn(() => 'picked');
    const getter2 = vi.fn(() => 'omitted');

    const props = {
      get prop1() {
        return getter1();
      },
      get prop2() {
        return getter2();
      },
      static: 'value',
    };

    const [picked, omitted] = splitProps(props, ['prop1', 'static']);

    expect(picked.prop1).toBe('picked');
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).not.toHaveBeenCalled();

    expect(omitted.prop2).toBe('omitted');
    expect(getter1).toHaveBeenCalledTimes(1);
    expect(getter2).toHaveBeenCalledTimes(1);

    expect(picked.static).toBe('value');
  });

  it('should preserve setter functionality after split', () => {
    const setterFn = vi.fn();
    const getterFn = vi.fn();
    let internalValue = 0;

    getterFn.mockImplementation(() => internalValue);
    setterFn.mockImplementation((v: number) => {
      internalValue = v * 2;
    });

    const props = {
      get value() {
        return getterFn();
      },
      set value(v: number) {
        setterFn(v);
      },
      other: 'test',
    };

    const [picked] = splitProps(props, ['value']);

    expect(setterFn).not.toHaveBeenCalled();
    expect(getterFn).not.toHaveBeenCalled();

    picked.value = 5;
    expect(setterFn).toHaveBeenCalledWith(5);
    expect(setterFn).toHaveBeenCalledTimes(1);

    expect(picked.value).toBe(10);
    expect(getterFn).toHaveBeenCalledTimes(1);

    picked.value = 7;
    expect(setterFn).toHaveBeenCalledWith(7);
    expect(setterFn).toHaveBeenCalledTimes(2);

    expect(picked.value).toBe(14);
    expect(getterFn).toHaveBeenCalledTimes(2);
  });

  it('should not invoke getter during split operation itself', () => {
    const getterFn = vi.fn(() => 'value');
    const props = {
      get lazy() {
        return getterFn();
      },
      eager: 'immediate',
    };

    const [picked] = splitProps(props, ['lazy']);

    // Getter should not be called during the split
    expect(getterFn).not.toHaveBeenCalled();

    // Only called when actually accessed
    picked.lazy;
    expect(getterFn).toHaveBeenCalledTimes(1);
  });
});

describe('mergeProps + splitProps - getter preservation chain', () => {
  it('should preserve getters through merge then split', () => {
    const getterFn = vi.fn();
    let count = 0;
    getterFn.mockImplementation(() => ++count);

    const obj1 = {
      get counter() {
        return getterFn();
      },
    };

    const obj2 = { other: 'prop' };

    // First merge
    const merged = mergeProps(obj1, obj2);

    expect(getterFn).not.toHaveBeenCalled();
    expect(merged.counter).toBe(1);
    expect(getterFn).toHaveBeenCalledTimes(1);

    // Then split
    const [picked, omitted] = splitProps(merged, ['counter']);

    expect(picked.counter).toBe(2);
    expect(getterFn).toHaveBeenCalledTimes(2);

    expect(picked.counter).toBe(3);
    expect(getterFn).toHaveBeenCalledTimes(3);

    expect(omitted).toEqual({ other: 'prop' });
  });
});
