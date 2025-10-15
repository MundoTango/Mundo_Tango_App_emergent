#!/bin/bash
# Phase 10 - Track D2: Artillery Load Testing Execution Script

echo "🎯 Phase 10: Artillery Load Testing"
echo "===================================="
echo ""

# Check if Artillery is installed
if ! command -v artillery &> /dev/null; then
    echo "❌ Artillery not found. Installing..."
    npm install -g artillery
fi

# Check if server is running
if ! curl -s http://localhost:5000/health > /dev/null; then
    echo "❌ Server not running on port 5000"
    echo "Please start the server first: npm run dev"
    exit 1
fi

echo "✅ Server is running"
echo ""

# Run load test
echo "🚀 Starting load test..."
echo "Phases:"
echo "  1. Warm-up: 10 RPS for 60s"
echo "  2. Ramp-up: 20 → 200 RPS over 120s"
echo "  3. Sustained: 200 RPS for 180s"
echo "  4. DDoS Spike: 1000 RPS for 60s"
echo "  5. Cool-down: 50 RPS for 60s"
echo ""
echo "Total duration: ~8 minutes"
echo ""

# Run Artillery test
artillery run tests/load/artillery-config.yml --output tests/load/results.json

# Check if test succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Load test completed successfully"
    echo ""
    
    # Generate HTML report
    echo "📊 Generating HTML report..."
    artillery report tests/load/results.json --output tests/load/report.html
    
    echo ""
    echo "✅ Report generated: tests/load/report.html"
    echo ""
    
    # Display summary
    echo "📈 Performance Summary:"
    cat tests/load/results.json | grep -A 5 "summary"
else
    echo ""
    echo "❌ Load test failed"
    exit 1
fi
