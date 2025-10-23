export function splitProps<T extends Record<string, any>, K extends keyof T>(
  props: T,
  keys: readonly K[]
): [Pick<T, K>, Omit<T, K>] {
  const picked = {} as Pick<T, K>;
  const omitted = {} as Omit<T, K>;

  // First, collect all keys from props
  for (const key in props) {
    if (Object.hasOwn(props, key)) {
      const descriptor = Object.getOwnPropertyDescriptor(props, key);

      if (keys.includes(key as any)) {
        // Key should be picked
        if (descriptor) {
          Object.defineProperty(picked, key, descriptor);
        } else {
          (picked as any)[key] = props[key];
        }
      } else {
        // Key should be omitted (in the "rest" object)
        if (descriptor) {
          Object.defineProperty(omitted, key, descriptor);
        } else {
          (omitted as any)[key] = props[key];
        }
      }
    }
  }

  return [picked, omitted];
}
