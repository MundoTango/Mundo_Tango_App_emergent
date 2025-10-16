// ESA LIFE CEO 56x21 - CommonJS-compatible vite config
const { defineConfig } = require("vite");
const react = require("@vitejs/plugin-react");
const path = require("path");
const runtimeErrorOverlay = require("@replit/vite-plugin-runtime-error-modal");

module.exports = defineConfig({
  plugins: [
    react.default(),
    runtimeErrorOverlay.default(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
    },
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "client/dist"),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
        inlineDynamicImports: true,
      },
    },
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
