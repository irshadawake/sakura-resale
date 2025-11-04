#!/bin/bash

# Kill existing processes
killall node 2>/dev/null
sleep 2

# Start backend
cd /Users/irshad.k/projects/sakura-nov2025/backend
nohup npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait for backend
sleep 8

# Start frontend
cd /Users/irshad.k/projects/sakura-nov2025/frontend
nohup npm run dev > frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo "Servers started. Check logs:"
echo "  Backend: tail -f /Users/irshad.k/projects/sakura-nov2025/backend/backend.log"
echo "  Frontend: tail -f /Users/irshad.k/projects/sakura-nov2025/frontend/frontend.log"
