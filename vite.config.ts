import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative asset URLs, so the built studio can be served from any static host
  // and from any subdirectory.
  base: './',
  server: {
    // HMR stays off: the managed preview drives reloads itself.
    hmr: false,
    // Reachable from outside the container.
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
