// TRACK 9: Performance Optimization Config
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          
          // Feature chunks
          'admin': [
            './client/src/pages/admin/dashboard.tsx',
            './client/src/pages/admin/users.tsx',
            './client/src/pages/admin/moderation.tsx'
          ],
          'events': ['./client/src/pages/EnhancedEvents.tsx'],
          'messaging': ['./client/src/pages/Messages.tsx']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  }
});
