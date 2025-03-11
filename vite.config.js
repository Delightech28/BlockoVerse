import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    port: process.env.PORT || 4173, // Use Render’s PORT or default to 4173
    host: "0.0.0.0"
  }
});
