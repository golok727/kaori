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
        type Element = TemplateResult<any>;
        type ElementType = string | JSXElement;
        interface ElementClass {
        }
        interface ElementAttributesProperty {
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
//# sourceMappingURL=types.d.ts.map