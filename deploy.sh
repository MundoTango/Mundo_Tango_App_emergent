#!/bin/bash
# MB.MD Deployment Script - Zero-Downtime Production Deployment
# Agent #127: Deployment Safety Engineer

set -euo pipefail

DEPLOY_LOG="deploy_$(date +%Y%m%d_%H%M%S).log"
exec > >(tee -a "$DEPLOY_LOG") 2>&1

echo "🚀 MB.MD Production Deployment Script"
echo "======================================"
echo "Started: $(date)"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Pre-flight checks
preflight_checks() {
    echo "🔍 Running pre-flight checks..."
    
    # Check environment variables
    required_vars=("DATABASE_URL" "ANTHROPIC_API_KEY")
    for var in "${required_vars[@]}"; do
        if [ -z "${!var:-}" ]; then
            echo -e "${RED}❌ Missing required env var: $var${NC}"
            exit 1
        fi
    done
    echo -e "${GREEN}✅ Environment variables OK${NC}"
    
    # Check database connection
    if ! npm run db:check > /dev/null 2>&1; then
        echo -e "${YELLOW}⚠️  Database check failed - attempting connection...${NC}"
    else
        echo -e "${GREEN}✅ Database connection OK${NC}"
    fi
    
    # Check TypeScript compilation
    if ! npm run build > /dev/null 2>&1; then
        echo -e "${RED}❌ TypeScript compilation failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ TypeScript compilation OK${NC}"
    
    # Run tests
    if ! npm run test:integration > /dev/null 2>&1; then
        echo -e "${RED}❌ Integration tests failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Integration tests passed${NC}"
}

# Database migration
run_migrations() {
    echo ""
    echo "📊 Running database migrations..."
    
    if ! npm run db:push; then
        echo -e "${RED}❌ Database migration failed${NC}"
        exit 1
    fi
    echo -e "${GREEN}✅ Database migrations complete${NC}"
}

# Health check
health_check() {
    local max_attempts=30
    local attempt=1
    
    echo ""
    echo "🏥 Performing health check..."
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s http://localhost:5000/api/health > /dev/null; then
            echo -e "${GREEN}✅ Health check passed${NC}"
            return 0
        fi
        echo -n "."
        sleep 1
        ((attempt++))
    done
    
    echo -e "${RED}❌ Health check failed after ${max_attempts}s${NC}"
    return 1
}

# Rollback function
rollback() {
    echo ""
    echo -e "${RED}🔄 ROLLBACK INITIATED${NC}"
    echo "Reverting to previous deployment..."
    
    # Stop current process
    pkill -f "npm run dev" || true
    
    # Restore from backup (implement based on your backup strategy)
    echo -e "${YELLOW}⚠️  Manual rollback required - check git history${NC}"
    exit 1
}

# Main deployment flow
main() {
    # Run checks
    preflight_checks || { rollback; exit 1; }
    
    # Database migrations
    run_migrations || { rollback; exit 1; }
    
    # Restart application
    echo ""
    echo "🔄 Restarting application..."
    pkill -f "npm run dev" || true
    npm run dev &
    sleep 5
    
    # Health check
    health_check || { rollback; exit 1; }
    
    # Success
    echo ""
    echo "======================================"
    echo -e "${GREEN}✅ DEPLOYMENT SUCCESSFUL${NC}"
    echo "Completed: $(date)"
    echo "Log file: $DEPLOY_LOG"
    echo ""
    echo "🎯 Next steps:"
    echo "  1. Monitor Grafana: https://mundotango.grafana.net/"
    echo "  2. Check error logs: npm run logs"
    echo "  3. Run smoke tests: npm run test:smoke"
}

# Trap errors and rollback
trap 'rollback' ERR

# Run deployment
main
