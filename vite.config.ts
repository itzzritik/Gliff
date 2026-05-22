import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import pkg from "./package.json" with { type: "json" };

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

const isPlayground = process.env.PLAYGROUND === "true";

const sharedBuild = { sourcemap: false, minify: "terser" } as const;

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(pkg.version),
	},
	plugins: [
		react(),
		...(isPlayground
			? []
			: [
					libInjectCss(),
					dts({
						insertTypesEntry: true,
						tsconfigPath: "./tsconfig.app.json",
						rollupTypes: true,
					}),
				]),
	],
	build: isPlayground
		? { ...sharedBuild, outDir: "playground-dist" }
		: {
				...sharedBuild,
				lib: {
					name: "Gliff",
					fileName: "gliff",
					entry: path.resolve(dirname, "src/index.ts"),
					formats: ["es"],
				},
				rollupOptions: {
					external: [
						"react",
						"react-dom",
						"react/jsx-runtime",
						"@lottiefiles/dotlottie-react",
					],
				},
			},
});
