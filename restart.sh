#!/bin/bash

# Kill existing processes
pkill -f "next dev"
pkill -f "tsx watch"
pkill -f "node.*backend"

# Wait a moment for processes to die
sleep 2

# Start backend
cd /Users/irshad.k/projects/sakura-nov2025/backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Start frontend
cd /Users/irshad.k/projects/sakura-nov2025/frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

echo "✅ Backend started (PID: $BACKEND_PID) - logs in backend.log"
echo "✅ Frontend started (PID: $FRONTEND_PID) - logs in frontend.log"
echo ""
echo "Backend: http://localhost:4000"
echo "Frontend: http://localhost:3000"
echo ""
echo "To stop: pkill -f 'next dev' && pkill -f 'tsx watch'"
