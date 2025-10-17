import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "client",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      "@lib": path.resolve(__dirname, "client/src/lib"),
      "@components": path.resolve(__dirname, "client/src/components"),
    },
  },
  optimizeDeps: {
    include: ["react", "react-dom"],
  },
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      external: [
        "@react-three/fiber",
        "@react-three/drei",
        "three",
        "gsap",
        "gsap/ScrollTrigger",
        "@gsap/react",
        "react-helmet",
        "@dnd-kit/core",
        "@dnd-kit/sortable",
        "@dnd-kit/utilities",
        "shepherd.js",
        "heic2any",
        "zustand",
        "@openreplay/tracker",
        "posthog-js"
      ],
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: false,
    allowedHosts: true,
  },
});
