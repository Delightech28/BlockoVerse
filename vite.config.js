import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows access from any network
    port: process.env.PORT || 5173,
    allowedHosts: ['blockoverse.onrender.com'], // Allow Render domain
  },
  preview: {
    host: true,
    port: process.env.PORT || 4173,
    allowedHosts: ['blockoverse.onrender.com'], // Allow Render domain
  },
});
