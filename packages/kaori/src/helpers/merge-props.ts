import {
  define_property,
  get_own_property_descriptor,
  has_own,
} from '../utils';

export function mergeProps(...props: any[]): any {
  return props.reduce((acc, prop) => {
    if (typeof prop === 'object') {
      for (const key in prop) {
        if (has_own(prop, key)) {
          const descriptor = get_own_property_descriptor(prop, key);
          if (descriptor) {
            define_property(acc, key, descriptor);
          } else {
            acc[key] = prop[key];
          }
        }
      }
    }
    return acc;
  }, {});
}
