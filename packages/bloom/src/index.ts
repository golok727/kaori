import { html, render } from "lit-html";
import { AsyncDirective, directive } from "lit-html/async-directive.js";
import { effect, untracked } from "@preact/signals-core";

export {
	signal,
	computed,
	effect as syncEffect,
	untracked,
} from "@preact/signals-core";

export { nothing } from "lit-html";
export { when } from "lit-html/directives/when.js";
export { choose } from "lit-html/directives/choose.js";
export { repeat } from "lit-html/directives/repeat.js";
export { map } from "lit-html/directives/map.js";

export type Bloom = {
	update(): void;
};

class ComponentDirective extends AsyncDirective {
	private _rawTemplate: (() => unknown) | unknown = null;
	private disposeEffect: (() => void) | null = null;
	private bloom: Bloom | null = null;
	private hasInitialized = false;

	private get _template() {
		return typeof this._rawTemplate === "function"
			? this._rawTemplate()
			: this._rawTemplate;
	}

	render<Props>(C: Component<Props>, props: Props): unknown {
		if (!this.hasInitialized) {
			// Create the bloom object with update method
			this.bloom = {
				update: () => {
					if (this._rawTemplate) {
						this.setValue(this._template);
					}
				},
			};

			const result = untracked(() => C({ bloom: this.bloom!, props }));

			this._rawTemplate = result;

			// Set up reactive effect AFTER storing template
			// watch this component if the return value is a render function
			if (typeof this._rawTemplate === "function") {
				this.disposeEffect?.();
				this.disposeEffect = effect(() => {
					if (this.isConnected) {
						console.log("effect run");
						const value = this._template;
						if (this.hasInitialized) this.setValue(value); // to not call setValue inside render / update
					}
				});
			}

			this.hasInitialized = true;

			// Return the initial template value without calling it again
			return this._template;
		}

		return this._template;
	}

	protected override disconnected(): void {
		// Clean up the effect when component unmounts
		if (this.disposeEffect) {
			this.disposeEffect();
			this.disposeEffect = null;
			console.log("Component Disposed");
		}
		// Keep initialized state so we don't recreate on reconnect
	}

	protected override reconnected(): void {
		this.disposeEffect?.();
		this.disposeEffect = null;
		if (this._rawTemplate && !this.disposeEffect) {
			this.disposeEffect = effect(() => {
				if (this._rawTemplate && this.isConnected) {
					const value = this._template;
					this.setValue(value);
				}
			});
		}
	}
}

export const componentDirective = directive(ComponentDirective);

export function component<Props>(component: Component<Props>, props: Props) {
	return componentDirective(component as Component<any>, props);
}

export type ComponentContext<Props> = {
	bloom: Bloom;
	props: Props;
};

export type Component<Props> = (
	cx: ComponentContext<Props>
) => unknown | (() => unknown);

type RenderOptions<Props> = {
	props: Props;
	target: HTMLElement;
};

function renderBloom<Props>(
	C: Component<Props>,
	{ props, target }: RenderOptions<Props>
) {
	const root = componentDirective(C as never, props as never);
	render(root, target);
}

export { renderBloom as render, html };
