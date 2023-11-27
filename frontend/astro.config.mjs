import { defineConfig } from 'astro/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import svelte from '@astrojs/svelte';

// https://astro.build/config
export default defineConfig({
  outDir: '../firebase/dist/frontend',
  renderers: ['@astrojs/react'],
  integrations: [svelte()],

  vite: {
    plugins: [
      tsconfigPaths({
        projects: ['./tsconfig.app.json'],
      }),
    ],
  },
});
