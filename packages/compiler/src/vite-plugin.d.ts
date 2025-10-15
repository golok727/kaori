import type { Plugin } from "vite";
export interface KaoriPluginOptions {
    /**
     * Include patterns for files to transform
     * @default [/\.[jt]sx?$/]
     */
    include?: (string | RegExp)[];
    /**
     * Exclude patterns for files to skip
     * @default [/node_modules/]
     */
    exclude?: (string | RegExp)[];
    /**
     * Enable TypeScript support
     * @default true
     */
    typescript?: boolean;
    /**
     * Babel options to merge
     */
    babelOptions?: any;
}
/**
 * Vite plugin for transforming JSX to lit-html templates using Kaori
 */
export declare function kaori(options?: KaoriPluginOptions): Plugin;
export default kaori;
//# sourceMappingURL=vite-plugin.d.ts.map