#!/bin/bash
# Touch Target Audit Script
# Finds all interactive elements and checks if they meet WCAG 2.1 Level AA standards (44x44px minimum)

echo "🎯 Touch Target Audit - WCAG 2.1 Level AA Compliance"
echo "=============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_FILES=0
FILES_WITH_ISSUES=0
TOTAL_ISSUES=0

# Patterns to search for interactive elements
PATTERNS=(
  "button"
  "onClick"
  "Link"
  "href="
  "input"
  "select"
  "textarea"
  "<a "
)

# Minimum touch target size patterns (good examples)
GOOD_PATTERNS=(
  "min-h-\[44px\]"
  "min-h-\[48px\]"
  "min-h-\[56px\]"
  "min-w-\[44px\]"
  "min-w-\[48px\]"
  "min-w-\[56px\]"
  "h-11"
  "h-12"
  "h-14"
  "w-11"
  "w-12"
  "w-14"
)

echo "📁 Scanning client/src/pages for interactive elements..."
echo ""

# Find all TSX files in pages directory
FILES=$(find client/src/pages -name "*.tsx" 2>/dev/null | sort)

for FILE in $FILES; do
  ((TOTAL_FILES++))
  FILE_ISSUES=0
  
  # Check if file has interactive elements
  HAS_INTERACTIVE=false
  for PATTERN in "${PATTERNS[@]}"; do
    if grep -q "$PATTERN" "$FILE"; then
      HAS_INTERACTIVE=true
      break
    fi
  done
  
  if [ "$HAS_INTERACTIVE" = true ]; then
    # Check if file has proper touch target sizing
    HAS_PROPER_SIZING=false
    for GOOD_PATTERN in "${GOOD_PATTERNS[@]}"; do
      if grep -q "$GOOD_PATTERN" "$FILE"; then
        HAS_PROPER_SIZING=true
        break
      fi
    done
    
    if [ "$HAS_PROPER_SIZING" = false ]; then
      # Count interactive elements without proper sizing
      BUTTON_COUNT=$(grep -c "button\|Button" "$FILE" 2>/dev/null || echo "0")
      LINK_COUNT=$(grep -c "Link\|href=" "$FILE" 2>/dev/null || echo "0")
      INPUT_COUNT=$(grep -c "input\|Input\|select\|textarea" "$FILE" 2>/dev/null || echo "0")
      
      # Ensure variables are single integers
      BUTTON_COUNT=${BUTTON_COUNT//[^0-9]/}
      LINK_COUNT=${LINK_COUNT//[^0-9]/}
      INPUT_COUNT=${INPUT_COUNT//[^0-9]/}
      BUTTON_COUNT=${BUTTON_COUNT:-0}
      LINK_COUNT=${LINK_COUNT:-0}
      INPUT_COUNT=${INPUT_COUNT:-0}
      
      FILE_ISSUES=$((BUTTON_COUNT + LINK_COUNT + INPUT_COUNT))
      
      if [ $FILE_ISSUES -gt 0 ]; then
        ((FILES_WITH_ISSUES++))
        ((TOTAL_ISSUES+=FILE_ISSUES))
        
        echo -e "${RED}❌ $(basename $FILE)${NC}"
        echo "   Path: $FILE"
        echo "   Interactive elements: ~$FILE_ISSUES"
        echo "   Missing: min-h-[44px] or equivalent classes"
        echo ""
      fi
    else
      echo -e "${GREEN}✅ $(basename $FILE)${NC}"
    fi
  fi
done

echo ""
echo "=============================================="
echo "📊 AUDIT SUMMARY"
echo "=============================================="
echo "Total pages scanned: $TOTAL_FILES"
echo -e "${GREEN}Pages with proper touch targets: $((TOTAL_FILES - FILES_WITH_ISSUES))${NC}"
echo -e "${RED}Pages needing fixes: $FILES_WITH_ISSUES${NC}"
echo -e "${YELLOW}Estimated interactive elements needing review: ~$TOTAL_ISSUES${NC}"
echo ""

if [ $FILES_WITH_ISSUES -eq 0 ]; then
  echo -e "${GREEN}🎉 All pages pass touch target audit!${NC}"
  exit 0
else
  if [ $TOTAL_FILES -gt 0 ]; then
    PERCENTAGE=$((100 * (TOTAL_FILES - FILES_WITH_ISSUES) / TOTAL_FILES))
  else
    PERCENTAGE=0
  fi
  echo -e "${YELLOW}📈 Current compliance: ${PERCENTAGE}%${NC}"
  echo ""
  echo "💡 RECOMMENDED FIXES:"
  echo "1. Add min-h-[44px] to all <button> and <Button> components"
  echo "2. Add min-h-[44px] to all <Link> and <a> elements"
  echo "3. Add min-h-[44px] to all form inputs (input, select, textarea)"
  echo "4. Consider using min-h-[48px] or min-h-[56px] for better UX"
  echo ""
  echo "📖 WCAG 2.1 Level AA Standard:"
  echo "   - Minimum touch target size: 44x44 CSS pixels"
  echo "   - Exception: Inline text links in paragraphs"
  echo ""
  exit 1
fi
