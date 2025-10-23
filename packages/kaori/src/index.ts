import { html } from 'lit-html';
import { AsyncDirective, directive } from 'lit-html/async-directive.js';
import { effect as syncEffect, untracked } from '@preact/signals-core';
import type { Component } from './types.js';
import { invariant } from './utils.js';

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
  logger: Logger
) {
  logger = logger;
}

// a handle to a component
export type ComponentHandle = {
  update(): void;
};

type ComponentHandleInternal = ComponentHandle & {
  __disposables: Set<() => void>;
  __dbg_n: string;
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

function on_mount(fn: () => (() => void) | void) {
  invariant(
    active_handle !== null,
    'onMount() should be called during component setup (not in render functions or effects)'
  );

  const handle = active_handle;
  queue_microtask(() => {
    const cleanup = fn();
    if (typeof cleanup === 'function') {
      handle.__disposables.add(cleanup);
    }
  });
}

function on_cleanup(fn: () => void) {
  const handle = active_handle;
  invariant(
    handle !== null,
    'onCleanup() should be called during component setup (not in render functions or effects)'
  );
  handle.__disposables.add(fn);
}

function kaoi_effect(fn: () => void, handle = active_handle) {
  invariant(
    handle !== null,
    'effect() should be called during component setup (not in render functions or effects)'
  );

  queue_microtask(() => {
    const dispose = untracked(() => syncEffect(fn));
    handle.__disposables.add(dispose);
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
  logger.log(`Disposing component(${handle.__dbg_n}) & running cleanup`);

  handle.__disposables.forEach(dispose => {
    try {
      dispose();
    } catch (e) {
      console.error('Error during cleanup:', e);
    }
  });
  handle.__disposables.clear();
}

class ComponentDirective<Props = any> extends AsyncDirective {
  private _rawTemplate: (() => unknown) | unknown = null;
  private handle: ComponentHandleInternal | null = null;
  private hasInitialized = false;

  private _cachedTemplate: unknown = null;

  private get $_getTemplate() {
    return typeof this._rawTemplate === 'function'
      ? this._rawTemplate()
      : this._rawTemplate;
  }

  render(C: Component<Props>, props: Props): unknown {
    const componentName = C.name || 'Anonymous';

    if (!this.hasInitialized) {
      logger.log('Initial render for component', componentName, props);
      this.handle = {
        __dbg_n: componentName,
        update: () => {
          this._cachedTemplate = this.$_getTemplate;
          if (this.handle) {
            schedule_update(this.handle, () => {
              if (this.isConnected) {
                this.setValue(this._cachedTemplate);
              }
            });
          }
        },
        __disposables: new Set<() => void>(),
      };

      const prev_handle = active_handle;
      active_handle = this.handle;
      const result = untracked(() => C(props));
      active_handle = prev_handle;

      this._rawTemplate = result;

      if (typeof this._rawTemplate === 'function') {
        // reactive return
        kaoi_effect(() => {
          logger.log('(effect) Update component: ', componentName);
          this.handle?.update();
        }, this.handle);
      }

      this._cachedTemplate = this.$_getTemplate;
      this.hasInitialized = true;
    }

    return this._cachedTemplate;
  }

  protected override disconnected(): void {
    // Clean up the effect when component unmounts
    if (this.handle) {
      dispose_handle(this.handle);
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
  kaoi_effect as effect,
  on_mount as onMount,
  on_cleanup as onCleanup,
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
export { type Ref, ref, createRef } from 'lit-html/directives/ref.js';
export { styleMap } from 'lit-html/directives/style-map.js';
export { classMap } from 'lit-html/directives/class-map.js';
