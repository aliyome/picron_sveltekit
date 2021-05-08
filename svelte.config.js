import preprocess from 'svelte-preprocess';
import adapter from '@sveltejs/adapter-static';
import { resolve, dirname } from 'path';

const __dirname = dirname(new URL(import.meta.url).pathname);

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://github.com/sveltejs/svelte-preprocess
	// for more information about preprocessors
	preprocess: [
		preprocess({
			postcss: true,
		}),
	],

	kit: {
		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
		}),
		vite: {
			resolve: {
				alias: {
					$components: resolve(__dirname, './src/components'),
					$infrastructures: resolve(__dirname, './src/infrastructures'),
					$config: resolve(__dirname, './src/config'),
				},
			},
		},
	},
};

export default config;
