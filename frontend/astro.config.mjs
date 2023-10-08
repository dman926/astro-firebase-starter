import { defineConfig } from 'astro/config';
import tsconfigPaths from 'vite-tsconfig-paths';

// https://astro.build/config
export default defineConfig({
  outDir: '../firebase/frontend-dist',
  vite: {
    resolve: './tsconfig.app.json',
    plugins: [tsconfigPaths()],
  },
});
