#!/bin/bash

echo "🧪 Testing AI Meta Factory API..."

BASE_URL="http://localhost:3000"

# Test 1: Health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/api/health" | jq . || echo "Raw response:"
curl -s "$BASE_URL/api/health"
echo ""

# Test 2: Create a test project
echo "2. Creating test project..."
curl -X POST "$BASE_URL/api/projects" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "API Test Project",
    "description": "Created via API test",
    "metadata": {
      "version": 1,
      "created": "'"$(date -Iseconds)"'"
    }
  }' 2>/dev/null || echo "POST request failed or endpoint not implemented"
echo ""

# Test 3: Test WebSocket connection
echo "3. Testing WebSocket availability..."
timeout 2 curl -s "$BASE_URL/socket.io/?EIO=4&transport=polling" > /dev/null && \
  echo "✅ WebSocket server responding" || \
  echo "❌ WebSocket server not responding"

# Test 4: Static file serving
echo "4. Testing static assets..."
curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/favicon.ico" && \
  echo "✅ Static assets serving" || \
  echo "❌ Static assets not found"

echo ""
echo "🎯 API Test Complete!"
