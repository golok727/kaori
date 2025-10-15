export type ForProps<Item, R = unknown> = {
    items: Iterable<Item>;
    children: (item: Item, index: number) => R;
    key?: (item: Item) => unknown;
};
export declare function For<Item = any, R = any>(props: {
    items: Iterable<Item>;
    children: (item: Item, index: number) => R;
    key?: (item: Item, index: number) => unknown;
}): () => import("lit-html").TemplateResult<1>;
export type ShowProps = {
    when: boolean;
    children: unknown;
    fallback?: () => unknown;
};
export declare function Show(props: ShowProps): () => unknown;
//# sourceMappingURL=helpers.d.ts.map