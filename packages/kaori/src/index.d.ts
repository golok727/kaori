import { html } from "lit-html";
import type { Component } from "./types.js";
export type Bloom = {
    update(): void;
};
type BloomInternal = Bloom & {
    __disposables: Set<() => void>;
};
declare function on_mount(fn: () => void): void;
declare function on_cleanup(fn: () => void): void;
declare function bloom_effect(fn: () => void, bloom?: BloomInternal | null): void;
declare function get_bloom(): Bloom;
interface ComponentDirectiveFn {
    <Props>(C: Component<Props>, props: Props): unknown;
}
export declare const component: ComponentDirectiveFn;
export { For, Show } from "./helpers";
export type { ForProps, ShowProps } from "./helpers";
export { get_bloom as getBloom, bloom_effect as effect, on_mount as onMount, on_cleanup as onCleanup, html, };
export { render } from "lit-html";
export * from "./types";
export { signal, type Signal, type Effect, type Computed, batch, computed, effect as syncEffect, untracked, } from "@preact/signals-core";
export { nothing } from "lit-html";
export { when } from "lit-html/directives/when.js";
export { choose } from "lit-html/directives/choose.js";
export { repeat } from "lit-html/directives/repeat.js";
export { map } from "lit-html/directives/map.js";
export { type Ref, ref, createRef } from "lit-html/directives/ref.js";
//# sourceMappingURL=index.d.ts.map