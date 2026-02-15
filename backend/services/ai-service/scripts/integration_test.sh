#!/bin/bash
# Integration test: idea → features → roadmap → code generation
# Assumes Flask proxy is running on localhost:8000

set -e

API_URL="http://localhost:8000"
GENERATE_ENDPOINT="$API_URL/generate"

echo "🚀 Starting integration test: Idea to Code"
echo "=========================================="

# Step 1: Define a sample idea
IDEA="Create a task management app with user authentication, task creation, and due dates."
echo -e "\n📝 Idea: $IDEA"

# Step 2: Analyze idea (extract features)
echo -e "\n🔍 Extracting features..."
FEATURE_PROMPT="Extract the core features from this project idea. Return a JSON array of objects with 'name', 'description', and 'priority' (high/medium/low). Idea: \"$IDEA\""

FEATURE_RESPONSE=$(curl -s -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"tinyllama-1.1b\", \"prompt\": \"$FEATURE_PROMPT\", \"max_tokens\": 300, \"temperature\": 0.3}")

echo "Raw response: $FEATURE_RESPONSE"
# Extract JSON array (simplistic)
FEATURES=$(echo "$FEATURE_RESPONSE" | grep -o '\[.*\]' | head -1)
if [ -z "$FEATURES" ]; then
  echo "⚠️  No features extracted, using fallback."
  FEATURES='[{"name":"User Authentication","priority":"high"},{"name":"Task CRUD","priority":"high"}]'
fi
echo "Features: $FEATURES"

# Step 3: Generate roadmap
echo -e "\n🗺️ Generating roadmap..."
ROADMAP_PROMPT="Create a detailed project roadmap for the following idea. Return a JSON array of objects with 'week' (number), 'title' (string), 'description' (string), and 'tasks' (array of strings). Idea: \"$IDEA\""

ROADMAP_RESPONSE=$(curl -s -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"tinyllama-1.1b\", \"prompt\": \"$ROADMAP_PROMPT\", \"max_tokens\": 500, \"temperature\": 0.4}")

echo "Raw response: $ROADMAP_RESPONSE"
ROADMAP=$(echo "$ROADMAP_RESPONSE" | grep -o '\[.*\]' | tail -1)
if [ -z "$ROADMAP" ]; then
  echo "⚠️  No roadmap generated, using fallback."
  ROADMAP='[{"week":1,"title":"Setup","description":"Initial setup","tasks":["Install tools"]}]'
fi
echo "Roadmap: $ROADMAP"

# Step 4: Generate code for the first feature
echo -e "\n💻 Generating code for first feature..."
FIRST_FEATURE=$(echo "$FEATURES" | grep -o '"name":"[^"]*"' | head -1 | cut -d':' -f2 | tr -d '"')
if [ -z "$FIRST_FEATURE" ]; then
  FIRST_FEATURE="authentication"
fi
CODE_PROMPT="Write code for a feature: $FIRST_FEATURE in a task management app. Use JavaScript/React."

CODE_RESPONSE=$(curl -s -X POST "$GENERATE_ENDPOINT" \
  -H "Content-Type: application/json" \
  -d "{\"model\": \"tinyllama-1.1b\", \"prompt\": \"$CODE_PROMPT\", \"max_tokens\": 300, \"temperature\": 0.2}")

echo "Raw response: $CODE_RESPONSE"
CODE=$(echo "$CODE_RESPONSE" | jq -r '.text' 2>/dev/null || echo "$CODE_RESPONSE")
echo -e "\n📄 Generated Code:\n$CODE"

echo -e "\n✅ Integration test completed."
