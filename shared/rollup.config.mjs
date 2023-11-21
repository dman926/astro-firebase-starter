import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { fileURLToPath } from 'node:url';
import pkg from './package.json' assert { type: 'json' };

const tsconfig = fileURLToPath(new URL("tsconfig.json", import.meta.url));

/** @type {import('rollup').RollupOptions[]} */
export default [
  // browser-friendly UMD build
  {
    input: 'src/index.ts',
    output: {
      name: 'shared',
      file: pkg.browser,
      format: 'umd',
      sourcemap: true,
    },
    plugins: [
      resolve(), // so Rollup can find `ms`
      commonjs(), // so Rollup can convert `ms` to an ES module
      typescript({
        tsconfig,
      }),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.ts',
    external: ['ms'],
    output: [
      { file: pkg.main, format: 'cjs', sourcemap: true },
      { file: pkg.module, format: 'es', sourcemap: true },
    ],
    plugins: [
      typescript({
        tsconfig,
      }),
    ],
  },
];
