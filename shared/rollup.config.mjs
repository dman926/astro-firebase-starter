import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import ts from 'typescript';
import { fileURLToPath } from 'node:url';

const tsconfig = fileURLToPath(new URL('tsconfig.json', import.meta.url));

const files = {
  cve: 'src/cve.ts',
  isFulfilled: 'src/isFulfilled.ts',
  image: 'src/image.ts',
  index: 'src/index.ts',
};

/**
 * Sourcemap generation is placing the source file paths one level too low
 */
const sourcemapPathTransform = (/** @type {string} */ relativeSourcePath) =>
  relativeSourcePath.startsWith('../')
    ? relativeSourcePath.substring(3)
    : relativeSourcePath;

/**
 * @typedef {import('rollup').RollupOptions} RollupOptions
 */

/** @type {RollupOptions[]} */
const umdFiles = Object.entries(files).map(([name, input]) => ({
  input,
  output: {
    name,
    file: `dist/${name}.umd.js`,
    format: 'umd',
    sourcemap: true,
    exports: 'named',
    sourcemapPathTransform: sourcemapPathTransform,
  },
  plugins: [
    resolve(), // so Rollup can find `ms`
    commonjs(), // so Rollup can convert `ms` to an ES module
    typescript({
      tsconfig,
      declaration: false,
      declarationMap: false,
      declarationDir: undefined,
    }),
  ],
}));

/** @type {RollupOptions[]} */
const cjsFiles = Object.entries(files).map(([name, input]) => ({
  input,
  external: ['ms'],
  output: [
    {
      name,
      file: `dist/${name}.cjs.js`,
      format: 'cjs',
      sourcemap: true,
      exports: 'named',
      sourcemapPathTransform: sourcemapPathTransform,
    },
    {
      name,
      file: `dist/${name}.esm.js`,
      format: 'es',
      sourcemap: true,
      exports: 'named',
      sourcemapPathTransform: sourcemapPathTransform,
    },
  ],
  plugins: [
    typescript({
      tsconfig,
      typescript: ts,
      declaration: true,
      exclude: ['rollup.config.mjs'],
    }),
  ],
}));

/** @type {RollupOptions[]} */
export default [
  // browser-friendly UMD build
  ...umdFiles,
  // CommonJS (for Node) and ES module (for bundlers) build.
  ...cjsFiles,
];
