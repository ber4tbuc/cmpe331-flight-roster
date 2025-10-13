#!/bin/bash

echo "🚀 Starting Flight Roster Management System..."

# Function to start service in background
start_service() {
    local service_name=$1
    local service_path=$2
    local port=$3
    
    echo "Starting $service_name on port $port..."
    cd "$service_path"
    mvn spring-boot:run > "../logs/${service_name}.log" 2>&1 &
    echo $! > "../logs/${service_name}.pid"
    cd ..
    sleep 5
}

# Create logs directory
mkdir -p logs

# Start all services
start_service "main-system" "main-system" "8080"
start_service "flight-info-service" "services/flight-info-service" "8081"
start_service "pilot-service" "services/pilot-service" "8082"
start_service "cabin-service" "services/cabin-service" "8083"
start_service "passenger-service" "services/passenger-service" "8084"

# Start frontend
echo "Starting Frontend on port 3000..."
cd frontend
npm install
npm start > "../logs/frontend.log" 2>&1 &
echo $! > "../logs/frontend.pid"
cd ..

echo "✅ All services started!"
echo "📊 Check logs in the 'logs' directory"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Main System: http://localhost:8080"
