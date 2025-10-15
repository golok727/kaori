import { html } from "lit-html";
import { AsyncDirective, directive } from "lit-html/async-directive.js";
import { effect as syncEffect, untracked } from "@preact/signals-core";
import { invariant } from "./utils.js";
const logger = {
    log: (...args) => {
        console.log("[Kaori:DEV]", ...args);
    },
};
// todo move to a runtime file
/*
 Globals
 -----------------------------------------------------------------------
*/
let active_bloom = null;
let is_micro_task_queued = false;
let queued_microtasks = [];
let queued_updates = [];
let dirty_blooms = new WeakSet();
/*--------------------------------------------------------------- */
function queue_microtask(fn) {
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
function schedule_update(bloom, fn) {
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
function on_mount(fn) {
    invariant(active_bloom !== null, "onMount() should be called during component setup (not in render functions or effects)");
    queue_microtask(fn);
}
function on_cleanup(fn) {
    const bloom = active_bloom;
    invariant(bloom !== null, "onCleanup() should be called during component setup (not in render functions or effects)");
    bloom.__disposables.add(fn);
}
function bloom_effect(fn, bloom = active_bloom) {
    invariant(bloom !== null, "effect() should be called during component setup (not in render functions or effects)");
    const dispose = untracked(() => syncEffect(fn));
    bloom.__disposables.add(dispose);
}
function get_bloom() {
    invariant(active_bloom !== null, "getBloom() can only be called during component setup (not in render functions or effects)");
    return active_bloom;
}
function dispose_bloom(bloom) {
    logger.log("Disposing bloom and running cleanup functions");
    bloom.__disposables.forEach((dispose) => {
        try {
            dispose();
        }
        catch (e) {
            console.error("Error during cleanup:", e);
        }
    });
    bloom.__disposables.clear();
}
class ComponentDirective extends AsyncDirective {
    constructor() {
        super(...arguments);
        this._rawTemplate = null;
        this.bloom = null;
        this.hasInitialized = false;
        this._cachedTemplate = null;
    }
    get $_getTemplate() {
        return typeof this._rawTemplate === "function"
            ? this._rawTemplate()
            : this._rawTemplate;
    }
    render(C, props) {
        const componentName = C.name || "Anonymous";
        if (!this.hasInitialized) {
            logger.log("Rendering component ", componentName, props);
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
                __disposables: new Set(),
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
                    logger.log("Effect, ", componentName);
                    this.bloom?.update();
                }, this.bloom);
            }
            this._cachedTemplate = this.$_getTemplate;
            this.hasInitialized = true;
        }
        return this._cachedTemplate;
    }
    disconnected() {
        // Clean up the effect when component unmounts
        if (this.bloom) {
            dispose_bloom(this.bloom);
        }
    }
    reconnected() {
        // we need to do something here :w
        //
    }
}
export const component = directive(ComponentDirective);
export { For, Show } from "./helpers";
export { get_bloom as getBloom, bloom_effect as effect, on_mount as onMount, on_cleanup as onCleanup, html, };
export { render } from "lit-html";
export * from "./types";
export { signal, batch, computed, effect as syncEffect, untracked, } from "@preact/signals-core";
export { nothing } from "lit-html";
export { when } from "lit-html/directives/when.js";
export { choose } from "lit-html/directives/choose.js";
export { repeat } from "lit-html/directives/repeat.js";
export { map } from "lit-html/directives/map.js";
export { ref, createRef } from "lit-html/directives/ref.js";
//# sourceMappingURL=index.js.map