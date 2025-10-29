import { html, nothing, type Part } from 'lit-html';
import { AsyncDirective, directive } from 'lit-html/async-directive.js';
import { effect as syncEffect, untracked } from '@preact/signals-core';
import type { Component } from './types.js';
import { invariant } from './utils.js';
import type { StyleInfo } from 'lit-html/directives/style-map.js';

export interface Logger {
  log: (...args: any[]) => void;
}

export const KaoriLogger: Logger = {
  log: (...args: any[]) => {
    console.log('[Kaori:DEV]', ...args);
  },
};

export const NoopLogger: Logger = {
  log: () => {
    // No operation
  },
};

let logger: Logger = NoopLogger;

export function _kaori_internal_set_logger_use_at_your_own_risk(
  newLogger: Logger
) {
  logger = newLogger;
}

// a handle to a component
export type ComponentHandle = {
  update(): void;
  provide<T>(context: Context<T>, value: T): void;
};

export const KaoriContextSymbol = Symbol.for('kaori.context');

export type Context<T> = { _fvr: typeof KaoriContextSymbol; __T__: T };

type ContextInternal = Context<any> & {
  __dbg_n: string;
  __key: symbol;
  __default: any;
};

const DISPOSED = 1 << 0;

type TeardownFn = () => void;
type ComponentHandleInternal = ComponentHandle & {
  d: ComponentDirective;
  t?: Array<TeardownFn>;
  f: number;
  dbg_n: string;
};

/*
 Globals
 -----------------------------------------------------------------------
*/
let active_handle: ComponentHandleInternal | null = null;
let is_micro_task_queued = false;
let queued_microtasks: Array<() => void> = [];
let queued_updates: Array<[ComponentHandleInternal, () => void]> = [];
let dirty_handles = new WeakSet<ComponentHandleInternal>();
/*--------------------------------------------------------------- */

function queue_microtask(fn: () => void) {
  if (!is_micro_task_queued) {
    is_micro_task_queued = true;
    queueMicrotask(flush_microtasks);
  }

  if (fn) {
    queued_microtasks.push(fn);
  }
}

function flush_microtasks() {
  is_micro_task_queued = false;

  if (queued_microtasks.length > 0) {
    let microtasks = queued_microtasks;
    queued_microtasks = [];
    for (let i = 0; i < microtasks.length; i++) {
      microtasks[i]();
    }
  }

  const needs_updates = queued_updates;
  queued_updates = [];

  for (let i = 0; i < needs_updates.length; i++) {
    const [handle, fn] = needs_updates[i];
    dirty_handles.delete(handle);
    fn();
  }
}

function schedule_update(handle: ComponentHandleInternal, fn: () => void) {
  if (dirty_handles.has(handle)) {
    return;
  }

  dirty_handles.add(handle);

  if (!is_micro_task_queued) {
    is_micro_task_queued = true;
    queueMicrotask(flush_microtasks);
  }

  queued_updates.push([handle, fn]);
}

function handle_add_teardown(handle: ComponentHandleInternal, fn: TeardownFn) {
  if (!handle.t) {
    handle.t = [];
  }
  handle.t.push(fn);
}

function on_mount(fn: () => (() => void) | void) {
  invariant(
    active_handle !== null,
    'onMount() should be called during component setup (not in render functions or effects)'
  );

  const handle = active_handle;
  queue_microtask(() => {
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      handle_add_teardown(handle, cleanup);
    }
  });
}

function on_cleanup(fn: () => void) {
  const handle = active_handle;
  invariant(
    handle !== null,
    'onCleanup() should be called during component setup (not in render functions or effects)'
  );
  handle_add_teardown(handle, fn);
}

function kaori_effect(fn: () => void, handle = active_handle) {
  invariant(
    handle !== null,
    'effect() should be called during component setup (not in render functions or effects)'
  );

  queue_microtask(() => {
    const dispose = untracked(() => syncEffect(fn));
    handle_add_teardown(handle, dispose);
  });
}

function get_handle(): ComponentHandle {
  invariant(
    active_handle !== null,
    'getHandle() can only be called during component setup (not in render functions or effects)'
  );

  return active_handle;
}

function dispose_handle(handle: ComponentHandleInternal) {
  logger.log(`Disposing component(${handle.dbg_n}) & running cleanup`);
  if ((handle.f & DISPOSED) !== 0) {
    return;
  }

  handle.f |= DISPOSED;

  handle.t?.forEach(dispose => {
    try {
      dispose();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  });
  handle.t = undefined;
}

function create_context<T>(defaultValue: T, options?: { label?: string }) {
  const contextKey = Symbol();

  const context: ContextInternal = {
    _fvr: KaoriContextSymbol,
    __dbg_n: options?.label || 'AnonymousContext',
    __key: contextKey,
    __default: defaultValue,
    __T__: undefined as any,
  };

  return context as Context<T>;
}

function provide_context<T>(context: Context<T>, value: T) {
  invariant(
    active_handle !== null,
    'provideContext() should be called during component setup (not in render functions or effects)'
  );

  const cx = context as ContextInternal;

  const handle = active_handle;
  const directive = handle.d as any;
  directive.__c = directive.__c ?? new Map();
  directive.__c.set(cx.__key, value);
}

function get_context<T>(context: Context<T>): T {
  invariant(
    active_handle !== null,
    'getContext() should be called during component setup (not in render functions or effects)'
  );

  const cx = context as ContextInternal;
  const handle = active_handle;
  let directive: ComponentDirective | null = handle.d;

  while (directive) {
    const c_map = (directive as any).__c as Map<symbol, any> | undefined;
    if (c_map && c_map.has(cx.__key)) {
      return c_map.get(cx.__key)!;
    }

    let part = (directive as any).__part as Part | undefined;
    let nextDirective = null;
    while (part) {
      const parent = (part as any)._$parent as Part | undefined;
      if (
        parent &&
        '__directive' in parent &&
        parent.__directive instanceof ComponentDirective
      ) {
        nextDirective = parent.__directive;
        break;
      }
      part = parent;
    }

    directive = nextDirective;
  }

  return cx.__default;
}

class ComponentDirective<Props = any> extends AsyncDirective {
  private _rawTemplate: (() => unknown) | unknown = null;
  private _template_cache: unknown = null;

  /**
   * @internal Context
   */
  __h: ComponentHandleInternal | null = null;
  /**
   * @internal Context
   */
  __c?: Map<any, any>;

  private $template() {
    const res =
      typeof this._rawTemplate === 'function'
        ? this._rawTemplate()
        : this._rawTemplate;
    return res;
  }

  render(C: Component<Props>, props: Props): unknown {
    const componentName = C.name || 'Anonymous';

    if (!this.__h) {
      logger.log('Initial render for component', componentName, props);
      this.__h = {
        f: 0,
        d: this,
        dbg_n: componentName,
        update: () => {
          this._template_cache = this.$template();
          if (this.__h) {
            schedule_update(this.__h, () => {
              if (this.isConnected) {
                this.setValue(this._template_cache);
              }
            });
          }
        },
        provide(context, value) {
          provide_context(context as ContextInternal, value);
        },
      };

      const prev_handle = active_handle;
      active_handle = this.__h;
      const result = untracked(() => C(props));
      active_handle = prev_handle;

      this._rawTemplate = result;

      if (typeof this._rawTemplate === 'function') {
        // reactive return
        kaori_effect(() => {
          logger.log('(effect) Update component: ', componentName);
          this.__h?.update();
        }, this.__h);
      }

      this._template_cache = this.$template();
    }

    return this._template_cache;
  }

  protected override disconnected(): void {
    if (this.__h) {
      dispose_handle(this.__h);
      this.__h = null;
      this.__c = undefined;
    }
  }

  protected override reconnected(): void {
    // we need to do something here :w
    //
  }
}

interface ComponentDirectiveFn {
  <Props>(C: Component<Props>, props: Props): unknown;
}

export const component = directive(ComponentDirective) as ComponentDirectiveFn;

export { For, Show } from './flow.js';
export { spread } from './helpers/spread.js';
export type { ForProps, ShowProps } from './flow.js';

export {
  /**
   * @deprecated use `getHandle` instead
   */
  get_handle as getBloom,
  get_handle as getHandle,
  kaori_effect as effect,
  on_mount as onMount,
  on_cleanup as onCleanup,
  get_context as useContext,
  create_context as createContext,
  provide_context as provideContext,
  html,
};
export { render } from 'lit-html';

export * from './types';

export {
  signal,
  type Signal,
  type Effect,
  type Computed,
  batch,
  computed,
  effect as syncEffect,
  untracked,
} from '@preact/signals-core';

export { mergeProps } from './helpers/merge-props.js';
export { splitProps } from './helpers/split-props.js';
export { ifDefined } from 'lit-html/directives/if-defined.js';
export { nothing } from 'lit-html';
export { when } from 'lit-html/directives/when.js';
export { choose } from 'lit-html/directives/choose.js';
export { repeat } from 'lit-html/directives/repeat.js';
export { map } from 'lit-html/directives/map.js';
export {
  type Ref,
  type RefOrCallback,
  ref,
  createRef,
} from 'lit-html/directives/ref.js';

import { styleMap as style_map } from 'lit-html/directives/style-map.js';
export type { StyleInfo } from 'lit-html/directives/style-map.js';

export function styleMap(styles: Readonly<StyleInfo> | string | undefined) {
  if (!styles) return nothing;
  if (typeof styles === 'string') return styles;
  return style_map(styles);
}

export { classMap } from 'lit-html/directives/class-map.js';
