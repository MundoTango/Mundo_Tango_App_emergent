#!/bin/bash
# ESA LIFE CEO 61x21 Framework - Production Startup Script

set -e

echo "🚀 Starting ESA LIFE CEO 61x21 Framework in Production Mode..."

# Set production environment
export NODE_ENV=production

# Log environment info
echo "📍 Environment: $NODE_ENV"
echo "🔌 Port: ${PORT:-5000}"
echo "🗄️ Database: ${MONGODB_URI:+Atlas MongoDB}${MONGODB_URI:-Mock Database}"

# Check if we have MongoDB Atlas connection
if [ -n "$MONGODB_URI" ]; then
    echo "✅ Using Atlas MongoDB for production"
else
    echo "⚠️  No MONGODB_URI found, using mock database"
fi

# Start the Node.js server
echo "🤖 Starting ESA Agent System (49/61 agents)..."
exec npx tsx server/minimal-server.ts