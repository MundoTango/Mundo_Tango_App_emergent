// Minimal Vite config for server/vite.ts import
// The actual config is defined inline in server/vite.ts

export default {
  root: 'client',
  build: {
    outDir: '../dist/public',
    emptyOutDir: true,
  },
};
