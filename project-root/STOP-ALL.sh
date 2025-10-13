#!/bin/bash

echo "🛑 Stopping Flight Roster Management System..."

# Function to stop service
stop_service() {
    local service_name=$1
    local pid_file="logs/${service_name}.pid"
    
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if ps -p $pid > /dev/null 2>&1; then
            echo "Stopping $service_name (PID: $pid)..."
            kill $pid
            rm "$pid_file"
        else
            echo "$service_name is not running"
        fi
    else
        echo "No PID file found for $service_name"
    fi
}

# Stop all services
stop_service "main-system"
stop_service "flight-info-service"
stop_service "pilot-service"
stop_service "cabin-service"
stop_service "passenger-service"
stop_service "frontend"

# Kill any remaining Java processes (Spring Boot)
echo "Killing remaining Java processes..."
pkill -f "spring-boot:run"

# Kill any remaining Node processes
echo "Killing remaining Node processes..."
pkill -f "npm start"

echo "✅ All services stopped!"
