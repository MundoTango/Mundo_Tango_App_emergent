#!/usr/bin/env bash
set -euo pipefail
echo "Starting EAS iOS build..."
eas build --platform ios --non-interactive
