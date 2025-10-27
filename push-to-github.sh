#!/bin/bash
# Push commits to GitHub using stored GITHUB_TOKEN

if [ -z "$GITHUB_TOKEN" ]; then
  echo "❌ Error: GITHUB_TOKEN not found in secrets"
  echo "Please add it in Replit Secrets tab"
  exit 1
fi

BRANCH=$(git branch --show-current)
echo "🚀 Pushing branch '$BRANCH' to GitHub..."

# Use token for authentication
git push https://$GITHUB_TOKEN@github.com/MundoTango/Mundo_Tango_App_emergent.git $BRANCH

if [ $? -eq 0 ]; then
  echo "✅ Successfully pushed to GitHub!"
  echo "🔗 View at: https://github.com/MundoTango/Mundo_Tango_App_emergent/commits/$BRANCH"
else
  echo "❌ Push failed. Check your GITHUB_TOKEN permissions."
fi
