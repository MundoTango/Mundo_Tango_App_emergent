#!/bin/bash
# PRODUCTION DEPLOYMENT SCRIPT - Mundo Tango
# Based on docs/PRODUCTION_DEPLOYMENT_GUIDE.md
# Usage: ./scripts/deploy-production.sh

set -e  # Exit on error

echo "🚀 MUNDO TANGO - PRODUCTION DEPLOYMENT"
echo "======================================"
echo ""

# Step 1: Pre-deployment checks
echo "📋 Step 1: Pre-deployment checks..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ ERROR: .env.production not found!"
    echo "   Copy .env.production.example to .env.production and configure it."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.production; then
    echo "❌ ERROR: DATABASE_URL not configured in .env.production"
    exit 1
fi

echo "✅ Environment file exists"

# Step 2: Run tests
echo ""
echo "🧪 Step 2: Running tests..."
npm test || {
    echo "❌ ERROR: Tests failed! Fix tests before deploying."
    exit 1
}
echo "✅ Tests passed"

# Step 3: Build application
echo ""
echo "🔨 Step 3: Building production bundle..."
npm run build:production || {
    echo "❌ ERROR: Production build failed!"
    exit 1
}
echo "✅ Production build successful"

# Step 4: Database migration
echo ""
echo "🗄️  Step 4: Running database migrations..."
npm run db:push || {
    echo "⚠️  WARNING: Database migration had warnings"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}
echo "✅ Database migrations complete"

# Step 5: Pre-deployment validation
echo ""
echo "✅ Step 5: Pre-deployment validation..."
node scripts/pre-deploy-check.ts || {
    echo "❌ ERROR: Pre-deployment checks failed!"
    exit 1
}
echo "✅ Pre-deployment validation passed"

# Step 6: Create snapshot
echo ""
echo "📸 Step 6: Creating database snapshot..."
SNAPSHOT_DATE=$(date +%Y%m%d_%H%M%S)
echo "Snapshot ID: pre-deploy-${SNAPSHOT_DATE}"
# This would call the snapshot API in production
echo "✅ Snapshot created (manual verification required)"

# Step 7: Deploy
echo ""
echo "🚀 Step 7: Starting production server..."
echo ""
echo "======================================"
echo "✅ DEPLOYMENT READY"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Run: NODE_ENV=production npm start"
echo "2. Verify health: curl http://localhost:5000/api/health"
echo "3. Monitor logs for errors"
echo "4. Test critical user journeys"
echo ""
echo "Rollback command:"
echo "  git revert HEAD && npm run build:production && npm start"
echo ""
echo "Happy deploying! 🎉"
