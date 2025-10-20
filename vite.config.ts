import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'client',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all network interfaces
    port: 5000, // CRITICAL: Must be 5000 (only non-firewalled port in Replit)
    strictPort: false,
    allowedHosts: ['.replit.dev', '.replit.app'], // Allow Replit dynamic hostnames
  },
  build: {
    outDir: path.resolve(__dirname, 'dist/public'),
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          leaflet: ['leaflet'],
          charts: ['recharts'],
          media: ['html2canvas', 'heic2any'],
        },
      },
    },
  },
});
