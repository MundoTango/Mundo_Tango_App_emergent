# Webpack Production Build System

## Overview

This document describes the alternative Webpack-based build system for the Mundo Tango React application. This is a production-ready build configuration that runs alongside the existing Vite setup.

## ✅ Completed Setup

### Configuration Files Created

1. **webpack.config.js** - Base Webpack configuration
   - Entry point: `client/src/main.tsx`
   - Output: `client/dist-webpack/`
   - Configured with TypeScript support via ts-loader
   - CSS extraction with MiniCssExtractPlugin
   - Production optimizations (Terser, code splitting)

2. **webpack.dev.js** - Development configuration
   - Development mode with source maps
   - Webpack dev server on port 3000
   - Hot module replacement enabled
   - Allowed hosts: all (Replit compatibility)

3. **webpack.prod.js** - Production configuration
   - Production mode with optimized source maps
   - Gzip compression plugin
   - Minification and tree shaking

4. **.babelrc** - Babel configuration
   - @babel/preset-env with polyfills (core-js 3)
   - @babel/preset-react (automatic runtime)
   - @babel/preset-typescript

5. **deploy-config.json** - Deployment configuration
   - Build command: `npm run build:webpack`
   - Output directory: `client/dist-webpack`
   - Target: Replit deployment

6. **nginx.conf** - Reference Nginx configuration (documentation only)
   - Gzip compression
   - Static asset caching
   - SPA fallback routing

7. **tsconfig.json** - Updated with optimizations
   - Incremental compilation enabled
   - Build info file: `.tsbuildinfo`
   - Skip lib check enabled

### Package.json Updates

**Scripts Added:**
```json
{
  "build:webpack": "webpack --config webpack.prod.js",
  "dev:webpack": "webpack serve --config webpack.dev.js",
  "analyze": "webpack-bundle-analyzer client/dist-webpack/stats.json"
}
```

**DevDependencies Added:**
- webpack ^5.95.0
- webpack-cli ^5.1.4
- webpack-dev-server ^5.1.0
- webpack-merge ^6.0.1
- ts-loader ^9.5.1
- terser-webpack-plugin ^5.3.10
- compression-webpack-plugin ^11.1.0
- html-webpack-plugin ^5.6.3
- mini-css-extract-plugin ^2.9.2
- css-loader ^7.1.2
- postcss-loader ^8.1.1
- webpack-bundle-analyzer ^4.10.2
- @babel/core ^7.26.0
- @babel/preset-env ^7.26.0
- @babel/preset-react ^7.25.9
- @babel/preset-typescript ^7.26.0
- babel-loader ^9.2.1
- core-js ^3.39.0

## 📦 Installation

### Option 1: Run Fix Script (Recommended)

```bash
./fix-npm-install-webpack.sh
```

This script will:
1. Remove corrupted node_modules
2. Clear npm cache
3. Fresh install all dependencies
4. Verify webpack installation

### Option 2: Manual Installation

```bash
# Remove corrupted node_modules
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Fresh install
npm install
```

## 🚀 Usage

### Build for Production

```bash
npm run build:webpack
```

Output: `client/dist-webpack/`

### Development Server

```bash
npm run dev:webpack
```

Server: http://localhost:3000

### Bundle Analysis

```bash
npm run analyze
```

## ⚙️ Configuration Details

### Webpack Aliases

Configured to match existing Vite setup:
- `@` → `client/src`
- `@shared` → `shared`
- `@assets` → `attached_assets`

### Code Splitting

Automatic code splitting configured:
- **react-vendor**: React and React-DOM
- **vendors**: Other node_modules
- Optimized chunk sizes

### Optimization Features

✅ Terser minification (console/debugger removal)
✅ CSS extraction and minification  
✅ Gzip compression (10KB threshold)
✅ Source maps for debugging
✅ Content hash for cache busting
✅ Tree shaking enabled

## 🔄 Relationship with Vite

This Webpack setup is an **ALTERNATIVE** build system:

- **Vite** (existing): `npm run build` → `client/dist/`
- **Webpack** (new): `npm run build:webpack` → `client/dist-webpack/`

Both can coexist. The emergency CDN system in `client/dist/index.html` remains untouched.

## 📊 Expected Output

After successful build:

```
client/dist-webpack/
├── index.html
├── js/
│   ├── main.[hash].js
│   ├── react-vendor.[hash].js
│   ├── vendors.[hash].js
│   └── *.js.map
├── assets/
│   └── [name]-[hash].[ext]
└── *.gz (gzip files)
```

## ✅ Success Criteria

- [x] Webpack configs created
- [x] Babel configuration set up
- [x] Package.json scripts added
- [x] Dependencies listed in package.json
- [x] TypeScript optimizations applied
- [x] Deployment config created
- [ ] Dependencies installed (run fix script)
- [ ] Build tested successfully

## 🐛 Troubleshooting

### NPM ENOTEMPTY Errors

If you encounter corrupted node_modules errors, run:

```bash
./fix-npm-install-webpack.sh
```

### Build Failures

1. Ensure all dependencies are installed
2. Check TypeScript errors: `npm run type-check`
3. Clear webpack cache: `rm -rf node_modules/.cache`

### Dev Server Issues

If dev server won't start:
- Check if port 3000 is available
- Ensure `allowedHosts: true` is set for Replit
- Verify entry point exists: `client/src/main.tsx`

## 🎯 Next Steps

1. Run installation: `./fix-npm-install-webpack.sh`
2. Test production build: `npm run build:webpack`
3. Verify bundle size: `ls -lh client/dist-webpack/`
4. Test dev server: `npm run dev:webpack`
5. Analyze bundle: `npm run analyze`

## 📝 Notes

- Output directory changed from `client/dist` to `client/dist-webpack` to avoid conflicts
- Emergency CDN React system untouched (client/dist/index.html)
- All Vite functionality preserved
- Babel uses automatic JSX runtime (no React import needed)
