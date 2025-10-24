#!/bin/bash
# STREAM 4: Update all 147 agent docs with MANDATORY_TESTING_HEADER.md
# Usage: ./scripts/update-agent-docs.sh

set -e

HEADER_FILE="docs/MANDATORY_TESTING_HEADER.md"
TOTAL=0
UPDATED=0

echo "📚 UPDATING AGENT DOCUMENTATION WITH TESTING PROTOCOL"
echo "======================================================"
echo ""

if [ ! -f "$HEADER_FILE" ]; then
    echo "❌ ERROR: $HEADER_FILE not found!"
    exit 1
fi

echo "✅ Header file found: $HEADER_FILE"
echo ""

# Read the header content
HEADER_CONTENT=$(cat "$HEADER_FILE")

# Find all agent docs
echo "🔍 Finding agent documentation files..."
find docs/agents -name "*.md" -type f | while read -r file; do
    TOTAL=$((TOTAL + 1))
    
    # Check if file already has the header
    if head -n 1 "$file" | grep -q "🧪 MANDATORY TESTING PROTOCOL"; then
        echo "⏭️  Skipping (already updated): $file"
    else
        echo "📝 Updating: $file"
        
        # Create temp file with header + original content
        {
            echo "$HEADER_CONTENT"
            echo ""
            echo "---"
            echo ""
            cat "$file"
        } > "${file}.tmp"
        
        # Replace original with updated
        mv "${file}.tmp" "$file"
        
        UPDATED=$((UPDATED + 1))
    fi
done

echo ""
echo "======================================================"
echo "✅ AGENT DOCS UPDATE COMPLETE"
echo "======================================================"
echo "Total files scanned: $TOTAL"
echo "Files updated: $UPDATED"
echo ""
echo "All agent docs now include mandatory testing protocol!"
