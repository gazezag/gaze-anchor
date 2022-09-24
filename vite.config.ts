import { defineConfig, splitVendorChunkPlugin } from 'vite';
import { resolve } from 'path';

const catAlias = (path: string): string => resolve(__dirname, path);

export default defineConfig({
  clearScreen: false,

  plugins: [splitVendorChunkPlugin()],

  resolve: {
    alias: {
      core: catAlias('./packages/core'),
      types: catAlias('./packages/types'),
      utils: catAlias('./packages/utils')
    }
  },

  build: {
    lib: {
      entry: resolve(__dirname, 'packages/index.ts'),
      name: 'gaze-anchor',
      fileName: fmt => `${fmt}/gaze-anchor.${fmt}.js`
    }
    // rollupOptions: {
    //   output: {
    //     manualChunks(id: string): string {
    //       if (id.includes('core')) {
    //         return 'core/index.js';
    //       }
    //       if (id.includes('plugins')) {
    //         return 'plugins/index.js';
    //       }
    //       if (id.includes('publicAPI')) {
    //         return 'publicAPI/index.js';
    //       }

    //       if (id.includes('node_modules')) {
    //         return id.toString().split('node_modules/')[1].split('/')[0].toString();
    //       }
    //     }
    //   }
    // }
  }
});
