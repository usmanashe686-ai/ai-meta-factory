#!/bin/bash
echo "🚀 Starting AI Factory Server..."
cd ~/ai-meta-factory
export NODE_OPTIONS="--no-warnings"
export PORT=3000
npx next dev
