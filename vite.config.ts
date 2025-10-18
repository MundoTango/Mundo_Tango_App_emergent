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
            // Core React libraries
            if (id.includes('react') || id.includes('react-dom') || id.includes('wouter')) {
              return 'vendor-react';
            }
            // UI component libraries
            if (id.includes('@radix-ui')) {
              return 'vendor-ui';
            }
            // Animation libraries
            if (id.includes('framer-motion') || id.includes('gsap') || id.includes('react-spring')) {
              return 'vendor-animation';
            }
            // Charts and visualizations
            if (id.includes('recharts') || id.includes('chart.js') || id.includes('d3')) {
              return 'vendor-charts';
            }
            // Maps
            if (id.includes('leaflet') || id.includes('mapbox')) {
              return 'vendor-maps';
            }
            // Socket.io and real-time
            if (id.includes('socket.io-client')) {
              return 'vendor-socket';
            }
            // React Query and data fetching
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms';
            }
            // i18n
            if (id.includes('i18next') || id.includes('react-i18next')) {
              return 'vendor-i18n';
            }
            // All other node_modules
            return 'vendor-other';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'wouter',
      '@tanstack/react-query',
      'socket.io-client',
      'i18next',
      'react-i18next',
      'framer-motion',
      'react-hook-form',
      '@hookform/resolvers/zod',
      'zod',
      'date-fns',
      'lucide-react',
    ],
    exclude: ['@tanstack/router-devtools'],
  },
  server: {
    port: 5000,
    strictPort: false,
    warmup: {
      clientFiles: ['./client/src/main.tsx', './client/src/App.tsx'],
    },
  },
});
