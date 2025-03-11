import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true, // Allows external access
    strictPort: true,
  },
  preview: {
    allowedHosts: ['blockoverse.onrender.com'] // Add your Render domain here
  }
});
