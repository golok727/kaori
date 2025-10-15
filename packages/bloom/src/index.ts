import { html, render } from "lit-html";
import { AsyncDirective, directive } from "lit-html/async-directive.js";
import { effect as syncEffect, untracked } from "@preact/signals-core";
import type { Component, RenderOptions } from "./types";
import { invariant } from "./utils";

export type Bloom = {
  update(): void;
};

type BloomInternal = Bloom & {
  __disposables: Set<() => void>;
};

// todo move to a runtime file
/*
 Globals
 -----------------------------------------------------------------------
*/
let active_bloom: BloomInternal | null = null;
let is_micro_task_queued = false;
let queued_microtasks: Array<() => void> = [];
let queued_updates: Array<[BloomInternal, () => void]> = [];
let dirty_blooms = new WeakSet<BloomInternal>();
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
    const [bloom, fn] = needs_updates[i];
    dirty_blooms.delete(bloom);
    fn();
  }
}

function schedule_update(bloom: BloomInternal, fn: () => void) {
  if (dirty_blooms.has(bloom)) {
    return;
  }

  dirty_blooms.add(bloom);

  if (!is_micro_task_queued) {
    is_micro_task_queued = true;
    queueMicrotask(flush_microtasks);
  }

  queued_updates.push([bloom, fn]);
}

function on_mount(fn: () => void) {
  invariant(
    active_bloom !== null,
    "onMount() should be called during component setup (not in render functions or effects)",
  );
  queue_microtask(fn);
}

function on_cleanup(fn: () => void) {
  const bloom = active_bloom;
  invariant(
    bloom !== null,
    "onCleanup() should be called during component setup (not in render functions or effects)",
  );
  bloom.__disposables.add(fn);
}

function bloom_effect(fn: () => void, bloom = active_bloom) {
  invariant(
    bloom !== null,
    "effect() should be called during component setup (not in render functions or effects)",
  );
  const dispose = untracked(() => syncEffect(fn));
  bloom.__disposables.add(dispose);
}

function get_bloom(): Bloom {
  invariant(
    active_bloom !== null,
    "getBloom() can only be called during component setup (not in render functions or effects)",
  );

  return active_bloom;
}

function dispose_bloom(bloom: BloomInternal) {
  console.log("Disposing bloom and running cleanup functions");
  bloom.__disposables.forEach((dispose) => {
    try {
      dispose();
    } catch (e) {
      console.error("Error during cleanup:", e);
    }
  });
  bloom.__disposables.clear();
}

class ComponentDirective<Props = any> extends AsyncDirective {
  private _rawTemplate: (() => unknown) | unknown = null;
  private bloom: BloomInternal | null = null;
  private hasInitialized = false;

  private _cachedTemplate: unknown = null;

  private get $_getTemplate() {
    return typeof this._rawTemplate === "function"
      ? this._rawTemplate()
      : this._rawTemplate;
  }

  render(C: Component<Props>, props: Props): unknown {
    const componentName = C.name || "Anonymous";

    if (!this.hasInitialized) {
      console.log("Rendering component ", componentName, props);
      // Create the bloom object with update method
      this.bloom = {
        update: () => {
          this._cachedTemplate = this.$_getTemplate;
          if (this.bloom) {
            schedule_update(this.bloom, () => {
              if (this.isConnected) {
                this.setValue(this._cachedTemplate);
              }
            });
          }
        },
        __disposables: new Set<() => void>(),
      };

      // Set current bloom context and call component
      const prevBloom = active_bloom;
      active_bloom = this.bloom;
      const result = untracked(() => C(props));
      active_bloom = prevBloom;

      this._rawTemplate = result;

      if (typeof this._rawTemplate === "function") {
        // reactive return
        bloom_effect(() => {
          console.log("Effect, ", componentName);
          this.bloom?.update();
        }, this.bloom);
      }

      this.hasInitialized = true;
    }

    return this._cachedTemplate;
  }

  protected override disconnected(): void {
    // Clean up the effect when component unmounts
    if (this.bloom) {
      dispose_bloom(this.bloom);
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

function render_bloom<Props>(
  C: Component<Props>,
  { props, target }: RenderOptions<Props>,
) {
  const root = html`${component(C as never, props as never)}`;
  render(root, target);
}

export { For, Show } from "./helpers";
export type { ForProps, ShowProps } from "./helpers";

export {
  render_bloom as render,
  get_bloom as getBloom,
  bloom_effect as effect,
  on_mount as onMount,
  on_cleanup as onCleanup,
  html,
};

export * from "./types";

export {
  signal,
  type Signal,
  type Effect,
  type Computed,
  batch,
  computed,
  effect as syncEffect,
  untracked,
} from "@preact/signals-core";

export { nothing } from "lit-html";
export { when } from "lit-html/directives/when.js";
export { choose } from "lit-html/directives/choose.js";
export { repeat } from "lit-html/directives/repeat.js";
export { map } from "lit-html/directives/map.js";
export { type Ref, ref, createRef } from "lit-html/directives/ref.js";
