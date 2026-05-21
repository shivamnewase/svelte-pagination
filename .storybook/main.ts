// import { svelte } from '@sveltejs/vite-plugin-svelte';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
// 	framework: '@storybook/sveltekit',
// 	stories: ['../src/**/*.stories.svelte'],
// 	addons: [],
// 	async viteFinal(config: import('vite').UserConfig) {
// 		config.plugins = config.plugins || [];
// 		config.plugins.push(svelte());
// 		config.resolve = {
// 			...config.resolve,
// 			alias: {
// 				...config.resolve?.alias,
// 				$lib: path.resolve(__dirname, '../src/lib')
// 			}
// 		};
// 		return config;
// 	}
// };

import type { StorybookConfig } from '@storybook/sveltekit';

const config: StorybookConfig = {
	stories: ['../src/**/*.stories.svelte'],
	addons: ['@storybook/addon-essentials', '@storybook/addon-svelte-csf'],
	framework: {
		name: '@storybook/sveltekit',
		options: {}
	}
};

export default config;
