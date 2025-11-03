#!/bin/bash

echo "🌸 Starting Sakura Resale Servers..."

# Kill any existing processes
pkill -f "ts-node src/index.ts" 2>/dev/null
pkill -f "next dev" 2>/dev/null
sleep 2

# Start backend
echo "Starting backend on port 4000..."
cd /Users/irshad.k/projects/sakura-nov2025/backend
npm run dev > /tmp/sakura-backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend PID: $BACKEND_PID"

# Wait for backend to start
sleep 5

# Start frontend
echo "Starting frontend on port 3000..."
cd /Users/irshad.k/projects/sakura-nov2025/frontend
npm run dev > /tmp/sakura-frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend PID: $FRONTEND_PID"

# Wait for frontend to start
sleep 5

echo ""
echo "✅ Servers started!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:4000"
echo "API Docs: http://localhost:4000/api-docs"
echo ""
echo "Backend logs: tail -f /tmp/sakura-backend.log"
echo "Frontend logs: tail -f /tmp/sakura-frontend.log"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
