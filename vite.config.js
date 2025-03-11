import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows access from any network
    port: process.env.PORT || 5173, // Uses Render's assigned port
  },
  preview: {
    host: true, // Exposes the preview
    port: process.env.PORT || 4173,
  },
});
