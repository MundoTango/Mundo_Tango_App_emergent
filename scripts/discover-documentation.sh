#!/bin/bash
# MB.MD Documentation Discovery Script
# Purpose: Automatically scan, catalog, and validate ALL documentation files
# Created: October 19, 2025
# Documentation Agent (#52) - Automated responsibility

set -euo pipefail

echo "🔍 MB.MD Documentation Discovery System"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Initialize counters
total_files=0
unmapped_files=0
orphan_files=0

# Create output directory
mkdir -p /tmp/doc-discovery

echo -e "${BLUE}📊 Phase 1: Discovering all documentation files...${NC}"
echo ""

# Find all markdown files
find docs -type f -name "*.md" | sort > /tmp/doc-discovery/all-docs.txt
total_files=$(wc -l < /tmp/doc-discovery/all-docs.txt)

echo -e "${GREEN}✓ Found ${total_files} total markdown files${NC}"
echo ""

# Count by directory
echo -e "${BLUE}📁 Phase 2: Cataloging by directory...${NC}"
echo ""

# Create JSON inventory
cat > /tmp/doc-discovery/inventory.json << EOF
{
  "discovery_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "total_files": ${total_files},
  "directories": {
EOF

# Count files per directory
first=true
for dir in docs/*/; do
  if [ -d "$dir" ]; then
    dirname=$(basename "$dir")
    count=$(find "$dir" -name "*.md" | wc -l)
    
    if [ "$first" = true ]; then
      first=false
    else
      echo "," >> /tmp/doc-discovery/inventory.json
    fi
    
    echo -n "    \"$dirname\": $count" >> /tmp/doc-discovery/inventory.json
    echo -e "  ${dirname}: ${count} files"
  fi
done

# Add root-level docs
root_count=$(ls -1 docs/*.md 2>/dev/null | wc -l)
echo "," >> /tmp/doc-discovery/inventory.json
echo -n "    \"root\": $root_count" >> /tmp/doc-discovery/inventory.json
echo -e "  root: ${root_count} files"

cat >> /tmp/doc-discovery/inventory.json << EOF

  }
}
EOF

echo ""
echo -e "${BLUE}📋 Phase 3: Checking mapping status...${NC}"
echo ""

# Check which files are mentioned in documentation maps
unmapped_files=0
while IFS= read -r docfile; do
  basename=$(basename "$docfile")
  
  # Check if file is referenced in either documentation map
  if ! grep -q "$basename" docs/DOCUMENTATION_MAP.md 2>/dev/null && \
     ! grep -q "$basename" docs/MB_MD_DOCUMENTATION_PHASE_MAP.md 2>/dev/null; then
    echo "$docfile" >> /tmp/doc-discovery/unmapped.txt
    ((unmapped_files++)) || true
  fi
done < /tmp/doc-discovery/all-docs.txt

if [ $unmapped_files -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found ${unmapped_files} unmapped documentation files${NC}"
  echo -e "${YELLOW}   See: /tmp/doc-discovery/unmapped.txt${NC}"
else
  echo -e "${GREEN}✓ All documentation files are mapped${NC}"
fi

echo ""
echo -e "${BLUE}📝 Phase 4: Analyzing documentation quality...${NC}"
echo ""

# Check for old files (>30 days without update)
find docs -name "*.md" -mtime +30 > /tmp/doc-discovery/old-docs.txt 2>/dev/null || true
old_count=$(wc -l < /tmp/doc-discovery/old-docs.txt)

if [ $old_count -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Found ${old_count} files not updated in 30+ days${NC}"
  echo -e "${YELLOW}   See: /tmp/doc-discovery/old-docs.txt${NC}"
else
  echo -e "${GREEN}✓ All documentation files recently updated${NC}"
fi

# Check for empty files
find docs -name "*.md" -size 0 > /tmp/doc-discovery/empty-docs.txt 2>/dev/null || true
empty_count=$(wc -l < /tmp/doc-discovery/empty-docs.txt)

if [ $empty_count -gt 0 ]; then
  echo -e "${RED}❌ Found ${empty_count} empty documentation files${NC}"
  echo -e "${RED}   See: /tmp/doc-discovery/empty-docs.txt${NC}"
else
  echo -e "${GREEN}✓ No empty documentation files${NC}"
fi

echo ""
echo -e "${BLUE}🔗 Phase 5: Checking cross-references...${NC}"
echo ""

# Check for broken links (basic check for .md references)
broken_links=0
while IFS= read -r docfile; do
  # Find markdown links
  grep -oP '\[.*?\]\((?!http).*?\.md\)' "$docfile" 2>/dev/null | \
    grep -oP '\(.*?\.md\)' | tr -d '()' | while read -r link; do
    
    # Resolve relative path
    docdir=$(dirname "$docfile")
    linkpath="$docdir/$link"
    
    if [ ! -f "$linkpath" ]; then
      echo "$docfile -> $link (BROKEN)" >> /tmp/doc-discovery/broken-links.txt
      ((broken_links++)) || true
    fi
  done
done < /tmp/doc-discovery/all-docs.txt

if [ $broken_links -gt 0 ]; then
  echo -e "${RED}❌ Found ${broken_links} broken documentation links${NC}"
  echo -e "${RED}   See: /tmp/doc-discovery/broken-links.txt${NC}"
else
  echo -e "${GREEN}✓ No broken links detected${NC}"
fi

echo ""
echo -e "${BLUE}📈 Discovery Summary${NC}"
echo "===================="
echo -e "Total files: ${GREEN}${total_files}${NC}"
echo -e "Unmapped files: ${YELLOW}${unmapped_files}${NC}"
echo -e "Old files (30+ days): ${YELLOW}${old_count}${NC}"
echo -e "Empty files: ${RED}${empty_count}${NC}"
echo -e "Broken links: ${RED}${broken_links}${NC}"
echo ""

# Save summary
cat > /tmp/doc-discovery/summary.txt << EOF
MB.MD Documentation Discovery Report
Generated: $(date)

STATISTICS:
- Total documentation files: ${total_files}
- Unmapped files: ${unmapped_files}
- Files not updated in 30+ days: ${old_count}
- Empty files: ${empty_count}
- Broken links: ${broken_links}

OUTPUT FILES:
- /tmp/doc-discovery/all-docs.txt - Complete file list
- /tmp/doc-discovery/inventory.json - Directory breakdown
- /tmp/doc-discovery/unmapped.txt - Files not in documentation maps
- /tmp/doc-discovery/old-docs.txt - Files older than 30 days
- /tmp/doc-discovery/empty-docs.txt - Empty documentation files
- /tmp/doc-discovery/broken-links.txt - Broken cross-references

NEXT ACTIONS:
1. Review unmapped files and add to DOCUMENTATION_MAP.md
2. Update or archive old documentation
3. Delete or populate empty files
4. Fix broken cross-references
EOF

echo -e "${GREEN}✅ Discovery complete!${NC}"
echo -e "   Full report: /tmp/doc-discovery/summary.txt"
echo -e "   JSON inventory: /tmp/doc-discovery/inventory.json"
echo ""

# If there are issues, exit with warning code
if [ $unmapped_files -gt 0 ] || [ $empty_count -gt 0 ] || [ $broken_links -gt 0 ]; then
  echo -e "${YELLOW}⚠️  Documentation maintenance required${NC}"
  exit 1
else
  echo -e "${GREEN}✅ Documentation system healthy${NC}"
  exit 0
fi
