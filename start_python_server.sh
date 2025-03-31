#!/bin/bash

# Kill any processes on ports we need
echo "Stopping any processes on ports 5000 and 5001..."
killall node 2>/dev/null || true
pkill -f "python app.py" 2>/dev/null || true

# Start the Python server
echo "Starting Python server..."
python app.py