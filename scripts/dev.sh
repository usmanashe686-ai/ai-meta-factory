#!/data/data/com.termux/files/usr/bin/bash

# Development script for Termux

echo "🔄 Starting development environment..."

# Start Redis in background
if ! redis-cli ping > /dev/null 2>&1; then
    echo "Starting Redis..."
    redis-server --daemonize yes
fi

# Start Firebase emulators
echo "Starting Firebase emulators..."
firebase emulators:start &

# Wait for emulators
sleep 5

# Start Next.js development server
echo "Starting Next.js dev server..."
npm run dev &

# Start job queue processor
echo "Starting job processor..."
node scripts/job-processor.js &

# Start WebSocket server
echo "Starting WebSocket server..."
node scripts/websocket-server.js &

echo "✅ All services running!"
echo "📱 Next.js: http://localhost:3000"
echo "🔥 Firebase UI: http://localhost:4000"
echo "💾 Redis: localhost:6379"

# Keep script running
wait


