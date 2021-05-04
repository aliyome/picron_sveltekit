const preprocess = require('svelte-preprocess');
const adapter = require('@sveltejs/adapter-static');
const { resolve } = require('path');

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
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
