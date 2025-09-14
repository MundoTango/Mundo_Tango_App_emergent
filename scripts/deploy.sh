#!/bin/bash

# ESA LIFE CEO 61x21 - Phase 21: Production Deployment Script
# This script handles the complete deployment process for production

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="ESA LIFE CEO 61x21"
DEPLOY_BRANCH=${DEPLOY_BRANCH:-"main"}
DEPLOY_ENV=${DEPLOY_ENV:-"production"}
BUILD_DIR="dist"
BACKUP_DIR="backups"
LOG_FILE="deploy-$(date +%Y%m%d-%H%M%S).log"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Function to check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    # Check Node.js version
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    REQUIRED_NODE="20.0.0"
    if [ "$(printf '%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_NODE" ]; then
        print_error "Node.js version $REQUIRED_NODE or higher is required (found $NODE_VERSION)"
        exit 1
    fi
    print_success "Node.js version: $NODE_VERSION"
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    print_success "npm is installed"
    
    # Check PostgreSQL client
    if ! command -v psql &> /dev/null; then
        print_warning "PostgreSQL client not found - database backup will be skipped"
    else
        print_success "PostgreSQL client is installed"
    fi
    
    # Check environment file
    if [ ! -f ".env.production" ]; then
        print_error ".env.production file not found"
        print_status "Creating from template..."
        if [ -f ".env.production.example" ]; then
            cp .env.production.example .env.production
            print_warning "Please configure .env.production before continuing"
            exit 1
        else
            print_error ".env.production.example not found"
            exit 1
        fi
    fi
    print_success "Environment configuration found"
}

# Function to create backup
create_backup() {
    print_status "Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz"
    
    # Backup current build
    if [ -d "$BUILD_DIR" ]; then
        tar -czf "$BACKUP_FILE" "$BUILD_DIR" 2>/dev/null || true
        print_success "Build backup created: $BACKUP_FILE"
    fi
    
    # Database backup (if PostgreSQL is available)
    if command -v pg_dump &> /dev/null && [ -n "${DATABASE_URL:-}" ]; then
        DB_BACKUP="$BACKUP_DIR/db-$(date +%Y%m%d-%H%M%S).sql"
        pg_dump "$DATABASE_URL" > "$DB_BACKUP" 2>/dev/null || print_warning "Database backup failed"
        if [ -f "$DB_BACKUP" ]; then
            print_success "Database backup created: $DB_BACKUP"
        fi
    fi
    
    # Clean old backups (keep last 10)
    ls -t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    ls -t "$BACKUP_DIR"/*.sql 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
}

# Function to run tests
run_tests() {
    print_status "Running tests..."
    
    # Type checking
    print_status "Running TypeScript type check..."
    npm run check 2>&1 | tee -a "$LOG_FILE" || {
        print_error "TypeScript type check failed"
        exit 1
    }
    print_success "Type check passed"
    
    # Linting (if available)
    if npm run | grep -q "lint"; then
        print_status "Running linter..."
        npm run lint 2>&1 | tee -a "$LOG_FILE" || print_warning "Linting failed (non-critical)"
    fi
    
    # Unit tests (if available)
    if npm run | grep -q "test:unit"; then
        print_status "Running unit tests..."
        npm run test:unit 2>&1 | tee -a "$LOG_FILE" || print_warning "Unit tests failed"
    fi
}

# Function to build application
build_application() {
    print_status "Building application..."
    
    # Clean previous build
    rm -rf "$BUILD_DIR"
    
    # Set production environment
    export NODE_ENV=production
    export DEPLOY_ENV=production
    export BUILD_TIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    export COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm ci --production=false 2>&1 | tee -a "$LOG_FILE" || {
        print_error "Dependency installation failed"
        exit 1
    }
    print_success "Dependencies installed"
    
    # Build frontend and backend
    print_status "Building production bundle..."
    NODE_OPTIONS="--max-old-space-size=4096" npm run build 2>&1 | tee -a "$LOG_FILE" || {
        print_error "Build failed"
        exit 1
    }
    print_success "Production build completed"
    
    # Optimize build
    print_status "Optimizing build..."
    
    # Remove development dependencies
    npm prune --production 2>&1 | tee -a "$LOG_FILE"
    
    # Clean npm cache
    npm cache clean --force 2>&1 | tee -a "$LOG_FILE"
    
    print_success "Build optimization completed"
}

# Function to run database migrations
run_migrations() {
    print_status "Running database migrations..."
    
    # Check if migrations are needed
    if [ -d "migrations" ] || npm run | grep -q "db:push"; then
        npm run db:push 2>&1 | tee -a "$LOG_FILE" || {
            print_error "Database migrations failed"
            exit 1
        }
        print_success "Database migrations completed"
    else
        print_warning "No migrations found"
    fi
}

# Function to perform health checks
health_check() {
    print_status "Performing health checks..."
    
    local MAX_RETRIES=30
    local RETRY_COUNT=0
    local HEALTH_URL="${HEALTH_CHECK_URL:-http://localhost:5000/health}"
    
    # Wait for service to be ready
    while [ $RETRY_COUNT -lt $MAX_RETRIES ]; do
        if curl -f -s "$HEALTH_URL" > /dev/null 2>&1; then
            print_success "Health check passed"
            
            # Detailed health check
            curl -s "${HEALTH_URL%/health}/ready" | python3 -m json.tool 2>/dev/null || true
            return 0
        fi
        
        RETRY_COUNT=$((RETRY_COUNT + 1))
        print_status "Waiting for service to be ready... ($RETRY_COUNT/$MAX_RETRIES)"
        sleep 2
    done
    
    print_error "Health check failed after $MAX_RETRIES attempts"
    return 1
}

# Function to deploy application
deploy_application() {
    print_status "Deploying application..."
    
    # Stop current service (if using PM2)
    if command -v pm2 &> /dev/null; then
        print_status "Stopping current service..."
        pm2 stop "$APP_NAME" 2>/dev/null || true
        pm2 delete "$APP_NAME" 2>/dev/null || true
    fi
    
    # Start new service
    print_status "Starting service..."
    
    if command -v pm2 &> /dev/null; then
        # Using PM2
        NODE_ENV=production pm2 start server/index.js \
            --name "$APP_NAME" \
            --max-memory-restart 1G \
            --instances 2 \
            --exec-mode cluster \
            --merge-logs \
            --log-date-format "YYYY-MM-DD HH:mm:ss Z" \
            2>&1 | tee -a "$LOG_FILE"
        
        pm2 save
        print_success "Service started with PM2"
    else
        # Using direct node
        NODE_ENV=production nohup node server/index.js > app.log 2>&1 &
        echo $! > app.pid
        print_success "Service started (PID: $(cat app.pid))"
    fi
}

# Function to verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Perform health check
    if health_check; then
        print_success "Deployment verification successful"
    else
        print_error "Deployment verification failed"
        
        # Rollback if needed
        if [ -f "$BACKUP_FILE" ]; then
            print_warning "Rolling back to previous version..."
            tar -xzf "$BACKUP_FILE" 2>/dev/null
            deploy_application
        fi
        exit 1
    fi
    
    # Check critical endpoints
    local ENDPOINTS=(
        "/api/health"
        "/api/version"
        "/api/metrics"
    )
    
    for endpoint in "${ENDPOINTS[@]}"; do
        if curl -f -s "http://localhost:5000$endpoint" > /dev/null 2>&1; then
            print_success "Endpoint $endpoint is accessible"
        else
            print_warning "Endpoint $endpoint is not accessible"
        fi
    done
}

# Function to send deployment notification
send_notification() {
    local STATUS=$1
    local MESSAGE=$2
    
    # Send to monitoring service (if configured)
    if [ -n "${MONITORING_WEBHOOK:-}" ]; then
        curl -X POST "$MONITORING_WEBHOOK" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"$STATUS\",\"message\":\"$MESSAGE\",\"timestamp\":\"$(date -u +"%Y-%m-%dT%H:%M:%SZ")\"}" \
            2>/dev/null || true
    fi
    
    # Log to file
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $STATUS: $MESSAGE" >> "$LOG_FILE"
}

# Function to clean up
cleanup() {
    print_status "Cleaning up..."
    
    # Remove temporary files
    rm -rf node_modules/.cache 2>/dev/null || true
    rm -rf .next/cache 2>/dev/null || true
    
    # Clean old logs (keep last 30 days)
    find . -name "*.log" -mtime +30 -delete 2>/dev/null || true
    
    print_success "Cleanup completed"
}

# Main deployment flow
main() {
    print_status "Starting deployment of $APP_NAME"
    print_status "Environment: $DEPLOY_ENV"
    print_status "Branch: $DEPLOY_BRANCH"
    echo ""
    
    # Create log file
    touch "$LOG_FILE"
    
    # Step 1: Prerequisites check
    check_prerequisites
    echo ""
    
    # Step 2: Create backup
    create_backup
    echo ""
    
    # Step 3: Run tests
    run_tests
    echo ""
    
    # Step 4: Build application
    build_application
    echo ""
    
    # Step 5: Run migrations
    run_migrations
    echo ""
    
    # Step 6: Deploy application
    deploy_application
    echo ""
    
    # Step 7: Verify deployment
    verify_deployment
    echo ""
    
    # Step 8: Clean up
    cleanup
    echo ""
    
    # Success notification
    print_success "Deployment completed successfully!"
    send_notification "SUCCESS" "Deployment of $APP_NAME completed successfully"
    
    # Show summary
    echo ""
    print_status "Deployment Summary:"
    echo "  - Environment: $DEPLOY_ENV"
    echo "  - Build Time: $BUILD_TIME"
    echo "  - Commit: $COMMIT_HASH"
    echo "  - Log File: $LOG_FILE"
    echo ""
    
    # Show next steps
    print_status "Next steps:"
    echo "  1. Monitor application logs: pm2 logs"
    echo "  2. Check application status: pm2 status"
    echo "  3. View metrics: curl http://localhost:5000/api/metrics"
    echo "  4. Run load tests if needed"
    echo ""
}

# Error handler
error_handler() {
    print_error "Deployment failed!"
    send_notification "FAILURE" "Deployment of $APP_NAME failed at line $1"
    exit 1
}

# Set error trap
trap 'error_handler $LINENO' ERR

# Run main function
main "$@"