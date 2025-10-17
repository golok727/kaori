import { html, nothing } from 'lit-html';
import { repeat } from 'lit-html/directives/repeat.js';

export type ForProps<Item, R = unknown> = {
  items: Iterable<Item>;
  children: (item: Item, index: number) => R;
  key?: (item: Item) => unknown;
};

export function For<Item = any, R = any>(props: {
  items: Iterable<Item>;
  children: (item: Item, index: number) => R;
  key?: (item: Item, index: number) => unknown;
}) {
  return () => {
    const items = props.items;
    const key = props.key;
    const children = props.children;

    if (key) {
      return html`${repeat(items, key, children)}`;
    }

    return html`${repeat(items, children)}`;
  };
}

export type ShowProps = {
  when: boolean;
  children: unknown;
  fallback?: () => unknown;
};

export function Show(props: ShowProps) {
  return () => {
    const fallback = props.fallback;
    const children = props.children;
    const when = props.when;

    if (when) {
      return children;
    }

    return fallback ? fallback() : nothing;
  };
}
