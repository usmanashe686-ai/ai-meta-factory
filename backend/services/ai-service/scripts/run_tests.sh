#!/bin/bash
# Run all AI feature tests
echo "Checking prerequisites..."
# Check if Flask proxy is running
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ AI server is running"
else
    echo "❌ AI server not running at http://localhost:8000. Please start it first."
    exit 1
fi

# Check Python environment
cd "$(dirname "$0")/../.." || exit
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "No virtualenv found, using system Python."
fi

echo "Running tests..."
python3 scripts/test_ai_features.py
