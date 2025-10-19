import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path, { dirname } from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// MB.MD DEPLOYMENT FIX: Set correct root directory for production build
export default defineConfig({
  // 🎯 CRITICAL: Set client/ as root so Vite can find index.html
  root: path.resolve(__dirname, "client"),
  
  plugins: [react(), themePlugin(), runtimeErrorOverlay()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@db": path.resolve(__dirname, "db"),
      "@assets": path.resolve(__dirname, "client", "src", "assets"),
    },
  },
  build: {
    // 🎯 Output to server/public for production serving
    outDir: path.resolve(__dirname, "server", "public"),
    emptyOutDir: true,
    sourcemap: true,
  },
});
