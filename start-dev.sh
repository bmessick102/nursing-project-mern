#!/bin/bash
echo "🚀 Starting Nursing Charting Application..."
echo ""
echo "Starting Backend Server..."
cd server
npm run dev &
SERVER_PID=$!
sleep 3

echo ""
echo "Starting Frontend Server..."
cd ../client
npm run dev &
CLIENT_PID=$!

echo ""
echo "✅ Both servers started!"
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop both servers"

wait
