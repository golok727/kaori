import { transformAsync } from "@babel/core";
import jsxToLitHtmlPlugin from "./babel-plugin.js";
/**
 * Vite plugin for transforming JSX to lit-html templates using Kaori
 */
export function kaori(options = {}) {
    const { include = [/\.[jt]sx?$/], exclude = [/node_modules/], typescript = true, babelOptions = {}, } = options;
    return {
        name: "vite:kaori",
        async transform(code, id) {
            // Check if file should be processed
            const shouldInclude = include.some((pattern) => typeof pattern === "string" ? id.includes(pattern) : pattern.test(id));
            const shouldExclude = exclude.some((pattern) => typeof pattern === "string" ? id.includes(pattern) : pattern.test(id));
            if (!shouldInclude || shouldExclude) {
                return null;
            }
            // Only process files that likely contain JSX
            if (!code.includes("<") ||
                (!code.includes("jsx") && !id.match(/\.[jt]sx?$/))) {
                return null;
            }
            try {
                // Prepare babel plugins
                const plugins = [["@babel/plugin-syntax-jsx"], [jsxToLitHtmlPlugin]];
                // Transform the code
                const result = await transformAsync(code, {
                    filename: id,
                    plugins,
                    parserOpts: {
                        plugins: typescript ? ["jsx"] : ["jsx"],
                    },
                    sourceMaps: true,
                    configFile: false,
                    babelrc: false,
                    ...babelOptions,
                });
                if (!result || !result.code) {
                    return null;
                }
                return {
                    code: result.code,
                    map: result.map,
                };
            }
            catch (error) {
                // Provide helpful error messages
                const errorMessage = error instanceof Error ? error.message : String(error);
                this.error(`Failed to transform ${id}: ${errorMessage}`);
            }
        },
        // Add to dev dependencies resolution
        config(config) {
            // Ensure JSX is handled properly in dev
            config.esbuild = config.esbuild || {};
            config.esbuild.jsx = "preserve"; // Let our plugin handle JSX transformation
        },
        // Handle HMR for better dev experience
        handleHotUpdate(_ctx) {
            // Let Vite handle HMR normally for JSX files
            // The transform will be re-applied automatically
            return undefined;
        },
    };
}
// Default export for convenience
export default kaori;
//# sourceMappingURL=vite-plugin.js.map