#!/bin/sh
PORT=${PORT:-3000}
echo "Starting server on port $PORT"
serve -s build -l $PORT