#!/bin/bash
# MB.MD Solution: Build MT Site with Bun (bypasses Vite/esbuild issues)

set -e  # Exit on any error

echo "🧠 MB.MD: Starting Bun-based build..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Step 1: Create output directory
echo "📁 Creating dist/public directory..."
mkdir -p dist/public
mkdir -p dist/public/assets

# Step 2: Check if client files exist
if [ ! -f "client/src/main.tsx" ]; then
    echo "❌ ERROR: client/src/main.tsx not found!"
    exit 1
fi

echo "✅ Source files found"

# Step 3: Build with Bun
echo "🔨 Building React app with Bun bundler..."
bun build client/src/main.tsx \
  --outdir dist/public/assets \
  --target browser \
  --format esm \
  --minify \
  --sourcemap=external

echo "✅ Bun build complete"

# Step 4: Copy HTML template
echo "📄 Copying index.html..."
if [ -f "client/index.html" ]; then
    cp client/index.html dist/public/index.html
    echo "✅ index.html copied"
else
    echo "⚠️  client/index.html not found, creating basic template..."
    cat > dist/public/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Mundo Tango</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/assets/main.js"></script>
  </body>
</html>
EOF
    echo "✅ Basic index.html created"
fi

# Step 5: Copy static assets if they exist
if [ -d "client/public" ]; then
    echo "📦 Copying static assets..."
    cp -r client/public/* dist/public/ 2>/dev/null || echo "No static assets to copy"
fi

# Step 6: Verify build
echo ""
echo "🔍 Build verification:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
ls -lh dist/public/ | head -20
echo ""
ls -lh dist/public/assets/ 2>/dev/null | head -10 || echo "No assets folder"
echo ""

# Step 7: Check if index.html exists
if [ -f "dist/public/index.html" ]; then
    echo "✅ BUILD SUCCESSFUL!"
    echo "📊 Output: $(du -sh dist/public/ | cut -f1)"
    echo ""
    echo "🚀 Next step: Restart your server to see the site!"
    exit 0
else
    echo "❌ BUILD FAILED: index.html not created"
    exit 1
fi
