#!/bin/bash
# Agent Test Automation Script
# Phase 3 - Stream 1: Quick Wins
# Runs all 24 functional tests (8 per agent)

echo "🧪 Running Agent Functional Tests..."
echo ""

echo "📝 Agent #128 - Voice + Visual Context Coordinator"
npm run test tests/agents/agent-128-tests.ts

echo ""
echo "📝 Agent #126 - Git Operations Specialist"
npm run test tests/agents/agent-126-tests.ts

echo ""
echo "📝 Agent #127 - Deployment Safety Engineer"
npm run test tests/agents/agent-127-tests.ts

echo ""
echo "✅ All agent tests complete!"
