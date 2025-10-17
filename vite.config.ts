import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  optimizeDeps: {
    include: [],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      // Stub aliases for missing optional packages
      "@gsap/react": path.resolve(__dirname, "client", "src", "stubs", "@gsap-react.ts"),
      "@react-three/fiber": path.resolve(__dirname, "client", "src", "stubs", "@react-three-fiber.ts"),
      "@react-three/drei": path.resolve(__dirname, "client", "src", "stubs", "@react-three-drei.ts"),
      "@openreplay/tracker": path.resolve(__dirname, "client", "src", "stubs", "@openreplay-tracker.ts"),
      "posthog-js": path.resolve(__dirname, "client", "src", "stubs", "posthog-js.ts"),
      "react-helmet": path.resolve(__dirname, "client", "src", "stubs", "react-helmet.ts"),
      "@dnd-kit/core": path.resolve(__dirname, "client", "src", "stubs", "@dnd-kit-core.tsx"),
      "@dnd-kit/sortable": path.resolve(__dirname, "client", "src", "stubs", "@dnd-kit-sortable.tsx"),
      "@dnd-kit/utilities": path.resolve(__dirname, "client", "src", "stubs", "@dnd-kit-utilities.ts"),
      "shepherd.js": path.resolve(__dirname, "client", "src", "stubs", "shepherd.js"),
      "heic2any": path.resolve(__dirname, "client", "src", "stubs", "heic2any.ts"),
      "gsap": path.resolve(__dirname, "client", "src", "stubs", "gsap"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu']
        }
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});