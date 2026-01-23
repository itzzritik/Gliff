import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [
		react(),
		libInjectCss(),
		dts({
			insertTypesEntry: true,
			tsconfigPath: "./tsconfig.app.json",
			rollupTypes: true,
		}),
	],
	build: {
		lib: {
			name: "Gliff",
			fileName: "gliff",
			entry: path.resolve(dirname, "src/index.ts"),
		},
		rollupOptions: {
			external: [
				"react",
				"react-dom",
				"react/jsx-runtime",
				"@lottiefiles/dotlottie-react",
			],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
					"react/jsx-runtime": "jsxRuntime",
					"@lottiefiles/dotlottie-react": "DotLottieReact",
				},
			},
		},
		sourcemap: false,
		minify: "esbuild",
	},
});
