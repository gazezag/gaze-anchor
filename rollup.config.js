import resolve from '@rollup/plugin-node-resolve';
import externals from 'rollup-plugin-node-externals';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import dts from 'rollup-plugin-dts';
import pkg from './package.json';

const coreEntry = 'packages/core/index.ts';
const publicAPIEntry = 'packages/publicAPI/index.ts';
const pluginsEntries = 'packages/plugins/index.ts';

const typeEntry = 'packages/index.ts';

const commonPlugins = [resolve(), commonjs(), typescript(), externals({ devDeps: false })];

export default () => {
  return [
    {
      input: [coreEntry],
      output: {
        name: pkg.name,
        dir: 'dist/core',
        format: 'es',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'packages'
      },
      plugins: commonPlugins
    },
    {
      input: [publicAPIEntry],
      output: {
        name: pkg.name,
        dir: 'dist/publicAPI',
        format: 'es',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'packages'
      },
      plugins: commonPlugins
    },
    {
      input: [pluginsEntries],
      output: {
        name: pkg.name,
        dir: 'dist/plugins',
        format: 'es',
        exports: 'named',
        preserveModules: true,
        preserveModulesRoot: 'packages'
      },
      plugins: commonPlugins
    },

    {
      input: [typeEntry],
      output: {
        name: pkg.name,
        dir: 'dist/types',
        format: 'es'
      },
      plugins: [...commonPlugins, dts()]
    }
  ];
};
