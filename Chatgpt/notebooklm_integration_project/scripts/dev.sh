#!/usr/bin/env bash
set -e
( cd server && npm run dev ) &
( cd client && npm run dev )
