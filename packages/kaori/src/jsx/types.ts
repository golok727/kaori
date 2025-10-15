import type { nothing, TemplateResult } from "lit-html";
import type { DirectiveResult } from "lit-html/async-directive.js";

declare global {
	namespace JSX {
		type JSXElement = [
			Generator,
			DirectiveResult<any>,
			typeof nothing,
			TemplateResult<any>,
			Node,
			JSXElement[],
			string & {},
			number,
			boolean,
			null,
			undefined,
			unknown
		][number];

		type Element = TemplateResult<any>; // This is the return type of a JSX template
		type ElementType = string | JSXElement;
		interface ElementClass {
			/* empty, libs can define requirements downstream */
		}
		interface ElementAttributesProperty {
			/* empty, libs can define requirements downstream */
		}
		interface ElementChildrenAttribute {
			children: {};
		}

		interface IntrinsicElements {
			[elemName: string]: {
				children?: any;
				[key: string]: any;
			};
		}
	}
}
