const colors = require('tailwindcss/colors');

module.exports = {
	mode: 'jit',
	purge: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: colors.indigo,
				secondary: colors.fuchsia,
				neutral: colors.gray,
			},
		},
	},
	plugins: [],
};
