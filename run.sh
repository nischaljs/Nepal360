#!/bin/bash

echo "Starting backend..."
cd backend
pnpm start &
BACKEND_PID=$!
cd ..

echo "Starting frontend..."
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

echo "Backend running with PID: $BACKEND_PID"
echo "Frontend running with PID: $FRONTEND_PID"
echo "Both services are running in the background."
echo "To stop them, run: kill $BACKEND_PID $FRONTEND_PID"
echo "You can access the frontend at http://localhost:5173 (default Vite port)."
echo "You can access the backend API (default port 3000) once it's fully started."

wait
