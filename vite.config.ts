import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import tailwindcss from "tailwindcss";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@lib": path.resolve(__dirname, "client", "src", "lib"),
      "@components": path.resolve(__dirname, "client", "src", "components"),
      "@hooks": path.resolve(__dirname, "client", "src", "hooks"),
      "@pages": path.resolve(__dirname, "client", "src", "pages"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  publicDir: path.resolve(__dirname, "client", "public"),
  build: {
    outDir: path.resolve(__dirname, "dist", "public"),
    emptyOutDir: true,
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: [tailwindcss()],
    },
  },
  server: {
    host: "0.0.0.0",
    port: 5000,
    strictPort: false,
    proxy: {},
  },
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
