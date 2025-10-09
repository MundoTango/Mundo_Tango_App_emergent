#!/usr/bin/env bash
set -euo pipefail
ROOT="ESA_MundoTango_Full_Repo"
mkdir -p "$ROOT"/{server,agents,db,edge,n8n,docs}
echo "Creating ESA repo..."
cat > "$ROOT/README.md" <<'EOF'
# ESA LIFE CEO × Mundo Tango — Full Orchestrator
Run this setup to reconstruct all modules (server, agents, db, edge, n8n, docs).
EOF
cat > "$ROOT/docs/ESA_FULL_BUILD_PLAN.json" <<'EOF'
{
  "meta": {
    "project": "ESA LIFE CEO \u00d7 Mundo Tango",
    "version": "61\u00d721 Agents Framework",
    "last_updated": "2025-10-06"
  },
  "modules": [
    "server",
    "agents",
    "db",
    "edge",
    "n8n",
    "docs"
  ]
}
EOF
echo "✅ Repo scaffold ready. Next: npm install in /server and setup Supabase."
