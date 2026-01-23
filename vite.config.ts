/// <reference types="vitest/config" />

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	plugins: [react(), dts({ insertTypesEntry: true, tsconfigPath: './tsconfig.app.json', rollupTypes: true })],
	build: {
		lib: {
			entry: path.resolve(dirname, 'src/index.ts'),
			name: 'Gliff',
			fileName: 'gliff',
		},
		rollupOptions: {
			external: ['react', 'react-dom', 'react/jsx-runtime', '@lottiefiles/dotlottie-react'],
			output: {
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM',
					'react/jsx-runtime': 'jsxRuntime',
					'@lottiefiles/dotlottie-react': 'DotLottieReact',
				},
			},
		},
		sourcemap: false,
		minify: 'esbuild',
	},
	test: {
		browser: {
			enabled: true,
			headless: true,
			provider: playwright({}),
			instances: [
				{
					browser: 'chromium',
				},
			],
		},
	},
});
