#!/bin/bash

# TRACK 2: Meshy.ai Avatar Generation Test Script
# This script tests the complete avatar generation workflow

echo "🎨 Meshy.ai Avatar Generation Test"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Step 1: Check avatar info
echo "📊 Step 1: Checking current avatar status..."
AVATAR_INFO=$(curl -s http://localhost:5000/api/avatar/info)
echo "$AVATAR_INFO" | jq '.'
echo ""

# Step 2: Generate avatar (will fail on free plan, but shows the flow)
echo "🚀 Step 2: Attempting to generate Mr Blue avatar..."
GENERATION_RESPONSE=$(curl -s -X POST http://localhost:5000/api/avatar/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Professional business consultant avatar, realistic humanoid male, wearing blue business suit, friendly approachable expression, corporate professional, full body character model, optimized for web 3D"
  }')

echo "$GENERATION_RESPONSE" | jq '.'
echo ""

# Check if generation was successful
if echo "$GENERATION_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
  TASK_ID=$(echo "$GENERATION_RESPONSE" | jq -r '.taskId')
  echo -e "${GREEN}✅ Generation started! Task ID: $TASK_ID${NC}"
  echo ""
  
  # Step 3: Monitor status (poll every 5 seconds)
  echo "📡 Step 3: Monitoring generation status..."
  for i in {1..60}; do
    STATUS_RESPONSE=$(curl -s http://localhost:5000/api/avatar/status/$TASK_ID)
    STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.status')
    PROGRESS=$(echo "$STATUS_RESPONSE" | jq -r '.progress')
    
    echo "   Status: $STATUS | Progress: $PROGRESS%"
    
    if [ "$STATUS" = "SUCCEEDED" ]; then
      echo -e "${GREEN}✅ Generation complete!${NC}"
      echo ""
      
      # Step 4: Download GLB
      echo "⬇️  Step 4: Downloading GLB file..."
      DOWNLOAD_RESPONSE=$(curl -s -X POST http://localhost:5000/api/avatar/download/$TASK_ID)
      echo "$DOWNLOAD_RESPONSE" | jq '.'
      
      if echo "$DOWNLOAD_RESPONSE" | jq -e '.success' > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Avatar downloaded successfully!${NC}"
        echo ""
        
        # Step 5: Verify file
        echo "🔍 Step 5: Verifying GLB file..."
        if [ -f "client/public/models/mr-blue-avatar.glb" ]; then
          FILE_SIZE=$(ls -lh client/public/models/mr-blue-avatar.glb | awk '{print $5}')
          echo -e "${GREEN}✅ GLB file exists: $FILE_SIZE${NC}"
          echo ""
          echo "🎉 Avatar generation complete! The MrBlueAvatar component will automatically load it."
        else
          echo -e "${RED}❌ GLB file not found${NC}"
        fi
      else
        echo -e "${RED}❌ Download failed${NC}"
      fi
      break
    elif [ "$STATUS" = "FAILED" ]; then
      echo -e "${RED}❌ Generation failed${NC}"
      break
    fi
    
    sleep 5
  done
else
  echo -e "${YELLOW}⚠️  Generation not started${NC}"
  echo ""
  echo "📋 Error Details:"
  echo "$GENERATION_RESPONSE" | jq '.'
  echo ""
  echo "💡 Solution:"
  echo "   1. Upgrade Meshy.ai plan at: https://www.meshy.ai/settings/subscription"
  echo "   2. Or manually place a GLB file at: client/public/models/mr-blue-avatar.glb"
  echo "   3. The MrBlueAvatar component will auto-detect and load it"
fi

echo ""
echo "=================================="
echo "✅ Test Complete"
echo "=================================="
