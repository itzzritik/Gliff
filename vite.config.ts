/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { playwright } from "@vitest/browser-playwright";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const dirname =
	typeof __dirname !== "undefined"
		? __dirname
		: path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
	plugins: [react(), dts({ insertTypesEntry: true })],
	build: {
		lib: {
			entry: path.resolve(dirname, "src/index.ts"),
			name: "Ion",
			fileName: "ion",
		},
		rollupOptions: {
			external: ["react", "react-dom", "react/jsx-runtime"],
			output: {
				globals: {
					react: "React",
					"react-dom": "ReactDOM",
				},
			},
		},
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({}),
			instances: [
				{
					browser: "chromium",
				},
			],
		},
	},
});
