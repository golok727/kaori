# Directives API

Directives from lit-html for advanced template features.

## classMap

Applies classes conditionally.

```tsx
import { classMap } from 'kaori.js';

<div classMap={{
  'active': isActive.value,
  'disabled': isDisabled.value
}}>
```

## styleMap

Applies inline styles.

```tsx
import { styleMap } from 'kaori.js';

<div style={{
  backgroundColor: color.value,
  width: `${width.value}px`
}}>
```

## ifDefined

Only sets attribute if value is defined.

```tsx
import { ifDefined } from 'kaori.js';

<img src={ifDefined(imageUrl.value)} alt="Image" />
```

## when

Conditional rendering directive.

```tsx
import { when } from 'kaori.js';

<div>
  {when(
    condition.value,
    () => <div>True</div>,
    () => <div>False</div>
  )}
</div>
```

## choose

Multi-way conditional.

```tsx
import { choose } from 'kaori.js';

<div>
  {choose(value.value, [
    [0, () => <div>Zero</div>],
    [1, () => <div>One</div>]
  ], () => <div>Other</div>)}
</div>
```

## repeat

List rendering with keys (used by For component).

```tsx
import { repeat } from 'kaori.js';

<ul>
  {repeat(
    items.value,
    (item) => item.id,
    (item) => <li>{item.name}</li>
  )}
</ul>
```

## map

Maps an iterable to templates.

```tsx
import { map } from 'kaori.js';

<ul>
  {map(items.value, (item) => <li>{item}</li>)}
</ul>
```

::: tip
Most of these directives are re-exported from lit-html. See [lit-html documentation](https://lit.dev/docs/v1/lit-html/template-reference/#built-in-directives) for more details.
:::
