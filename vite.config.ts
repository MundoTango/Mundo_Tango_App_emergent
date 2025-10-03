import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from 'url';
// ESA Fix: Disabled runtime error overlay - conflicts with React hooks
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Fix: Remove async from defineConfig and use conditional import properly
export default defineConfig({
  plugins: [
    react(),
    // ESA Fix: Removed runtimeErrorOverlay() - was causing React hooks errors
    // Conditionally add cartographer plugin without top-level await
    ...(process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
      ? [
          // Note: @replit/vite-plugin-cartographer is only loaded in dev mode
          // The module will be lazily loaded when needed
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      // ESA Layer 15: Force single React instance to prevent hook errors
      "react": path.resolve(__dirname, "node_modules", "react"),
      "react-dom": path.resolve(__dirname, "node_modules", "react-dom"),
    },
    // ESA Layer 15: Deduplicate React to prevent multiple instances
    dedupe: ['react', 'react-dom'],
  },
  root: path.resolve(__dirname, "client"),
  build: {
      outDir: 'dist',
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      // ESA Performance optimizations
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          manualChunks: {
            // Split vendor libraries for better caching
            // ESA Layer 15: Removed react-router-dom (app uses wouter)
            vendor: ['react', 'react-dom', 'wouter'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-tabs'],
            tanstack: ['@tanstack/react-query'],
            utils: ['lodash', 'date-fns', 'zod']
          },
          // Optimize asset names for caching
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js'
        }
      },
      // Optimize dependencies
      assetsInlineLimit: 4096, // Inline assets < 4kb
      reportCompressedSize: false // Faster builds
    },
    // ESA Performance: Optimize dependency pre-bundling
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        '@tanstack/react-query',
        'wouter',
        'lucide-react'
      ],
      exclude: ['@replit/vite-plugin-cartographer']
    },
    server: {
      hmr: {
        clientPort: 443
      },
      allowedHosts: true, // Critical for Replit dynamic hosts
      fs: {
        strict: true,
        deny: ["**/.*"],
      },
    },
});