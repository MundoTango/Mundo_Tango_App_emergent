#!/bin/bash
# Database Backup Script
# Run this before any major changes

set -e

BACKUP_DIR="backups/database"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/mundo-tango-backup-${TIMESTAMP}.dump"

echo "🔄 Creating database backup..."

# Create backup directory if it doesn't exist
mkdir -p "${BACKUP_DIR}"

# Perform backup
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL not set"
    exit 1
fi

pg_dump "$DATABASE_URL" -Fc -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ Backup successful: $BACKUP_FILE"
    ls -lh "$BACKUP_FILE"
    
    # Keep only last 7 backups
    echo "🧹 Cleaning old backups (keeping last 7)..."
    ls -t "${BACKUP_DIR}"/*.dump 2>/dev/null | tail -n +8 | xargs -r rm
    
    echo "📊 Current backups:"
    ls -lh "${BACKUP_DIR}"/*.dump 2>/dev/null || echo "No backups found"
else
    echo "❌ Backup failed"
    exit 1
fi
