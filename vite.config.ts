import { defineConfig } from 'vite';
import { resolve } from 'path';

const catAlias = (path: string): string => resolve(__dirname, path);

export default defineConfig({
  clearScreen: false,

  resolve: {
    alias: {
      core: catAlias('./packages/core'),
      api: catAlias('./packages/api'),
      types: catAlias('./packages/types'),
      utils: catAlias('./packages/utils')
    }
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'packages/index.ts'),
      name: 'gaze-anchor',
      fileName: fmt => `gaze-anchor.${fmt}.js`
    }
  }
});
