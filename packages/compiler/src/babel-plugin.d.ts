import type { PluginObj, PluginPass } from "@babel/core";
interface PluginState extends PluginPass {
    needsComponentImport?: boolean;
    hasComponentImport?: boolean;
    needsHtmlImport?: boolean;
    hasHtmlImport?: boolean;
    htmlTagName?: string;
    componentFunctionName?: string;
}
declare function jsxToLitHtmlPlugin(): PluginObj<PluginState>;
export default jsxToLitHtmlPlugin;
//# sourceMappingURL=babel-plugin.d.ts.map