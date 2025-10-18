import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  root: 'client',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
    },
  },
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('wouter')) {
              return 'vendor';
            }
            if (id.includes('@radix-ui')) {
              return 'ui';
            }
          }
        },
      },
    },
  },
  server: {
    port: 5000,
    strictPort: false,
  },
});
