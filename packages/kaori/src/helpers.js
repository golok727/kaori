import { html, nothing } from "lit-html";
import { repeat } from "lit-html/directives/repeat.js";
export function For(props) {
    return () => {
        const items = props.items;
        const key = props.key;
        const children = props.children;
        if (key) {
            return html `${repeat(items, key, children)}`;
        }
        return html `${repeat(items, children)}`;
    };
}
export function Show(props) {
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
//# sourceMappingURL=helpers.js.map