import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Absolute base matching the GitHub Pages project path
// (https://ianagustin49.github.io/Frozen-Banana-Ian/). This must be absolute,
// not './', so asset URLs resolve correctly even when the page is opened
// without a trailing slash. Combined with HashRouter it avoids deep-link 404s.
export default defineConfig({
  base: '/Frozen-Banana-Ian/',
  plugins: [react()],
});
