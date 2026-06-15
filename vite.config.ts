import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Relative base so the build works at any GitHub Pages subpath regardless of
// the repository's exact name/casing. Combined with HashRouter this avoids
// deep-link 404s.
export default defineConfig({
  base: './',
  plugins: [react()],
});
