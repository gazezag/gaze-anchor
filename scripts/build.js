const { resolve, join } = require('path');
const pkg = require('../package.json');
const { defineConfig, build } = require('vite');

const entryDir = resolve(join(__dirname, '..'), 'packages');
const outDir = resolve(join(__dirname, '..'), 'dist');

const baseConfig = defineConfig({
  configFile: false,
  publicDir: false
});

const rollupOptions = {
  output: {
    // TODO
  }
};

const buildAll = async () => {
  await build({
    ...baseConfig,
    build: {
      rollupOptions,
      lib: {
        entry: resolve(entryDir, 'index.ts'),
        name: pkg.name,
        fileName: pkg.name,
        formats: ['es', 'umd']
      },
      outDir
    }
  });
};

const buildLib = async () => {
  await buildAll();
};

buildLib();
