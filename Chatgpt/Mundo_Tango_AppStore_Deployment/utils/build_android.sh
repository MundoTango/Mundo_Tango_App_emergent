#!/usr/bin/env bash
set -euo pipefail
echo "Starting EAS Android build..."
eas build --platform android --non-interactive
