export function invariant(
  condition: boolean,
  message: string
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export const has_own = Object.hasOwn;
export const get_own_property_descriptor = Object.getOwnPropertyDescriptor;
export const define_property = Object.defineProperty;
