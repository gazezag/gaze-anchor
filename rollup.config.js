import resolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

const mainEntry = 'packages/index.ts';
const publicAPIEntry = 'packages/publicAPI/index.ts';
const pluginEntries = () => {
  // TODO
};

const commonPlugins = [resolve(), commonjs(), typescript(), externals({ devDeps: false })];

export default () => {
  return [
    {
      input: [mainEntry, publicAPIEntry],
      output: {
        name: pkg.name,
        dir: 'dist',
        format: 'es',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'packages'
      },
      plugins: commonPlugins
    },
    {
      input: [mainEntry, publicAPIEntry],
      output: {
        name: pkg.name,
        dir: 'dist/types',
        format: 'es',
        exports: 'named'
      },
      plugins: [...commonPlugins, dts()]
    }
  ];
};
