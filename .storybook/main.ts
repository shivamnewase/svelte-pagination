import { svelte } from '@sveltejs/vite-plugin-svelte';
import path from 'path';

export default {
  framework: '@storybook/svelte-vite',
  stories: ['../src/**/*.stories.svelte'],
  addons: [],
  async viteFinal(config: import('vite').UserConfig) {
    config.plugins = config.plugins || [];
    config.plugins.push(svelte());
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve?.alias,
        '$lib': path.resolve(__dirname, '../src/lib')
      }
    };
    return config;
  }
};