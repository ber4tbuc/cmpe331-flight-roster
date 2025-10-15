# Flight Roster Management System

A comprehensive microservices-based flight roster management system built with Spring Boot and React.

berat mal

## 🚀 Quick Start

### Prerequisites

#### **Windows:**
- Java 17+
- Node.js 16+
- Maven 3.6+
- PostgreSQL 12+ (Tested with PostgreSQL 18)

#### **macOS/Linux:**
```bash
# Install using Homebrew (macOS)
brew install openjdk@17 node maven postgresql@18

# Or install manually:
# - Java 17+
# - Node.js 16+
# - Maven 3.6+
# - PostgreSQL 12+
```

### Database Setup

#### **Windows:**
1. **Install PostgreSQL** and create databases:
   ```sql
   CREATE DATABASE main_db;
   CREATE DATABASE flight_info_db;
   CREATE DATABASE pilot_db;
   CREATE DATABASE cabin_db;
   CREATE DATABASE passenger_db;
   ```

#### **macOS/Linux:**
1. **Start PostgreSQL service:**
   ```bash
   # macOS with Homebrew
   brew services start postgresql@18
   
   # Or manually
   sudo systemctl start postgresql  # Linux
   ```

2. **Create databases:**
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create databases
   CREATE DATABASE main_db;
   CREATE DATABASE flight_info_db;
   CREATE DATABASE pilot_db;
   CREATE DATABASE cabin_db;
   CREATE DATABASE passenger_db;
   \q
   ```

#### **Default PostgreSQL credentials:**
- Username: `postgres`
- Password: `1234`
- Port: `5432`

### Running the Application

#### **Windows:**
1. **Start all services:**
   ```bash
   START-ALL.bat
   ```

2. **Stop all services:**
   ```bash
   STOP-ALL.bat
   ```

#### **macOS/Linux:**
1. **Start all services:**
   ```bash
   chmod +x START-ALL.sh
   ./START-ALL.sh
   ```

2. **Stop all services:**
   ```bash
   chmod +x STOP-ALL.sh
   ./STOP-ALL.sh
   ```

#### **Manual Start (All Platforms):**
   ```bash
   # Main System (Port 8080)
   cd main-system && mvn spring-boot:run
   
   # Flight Info Service (Port 8081)
   cd services/flight-info-service && mvn spring-boot:run
   
   # Pilot Service (Port 8082)
   cd services/pilot-service && mvn spring-boot:run
   
   # Cabin Service (Port 8083)
   cd services/cabin-service && mvn spring-boot:run
   
   # Passenger Service (Port 8084)
   cd services/passenger-service && mvn spring-boot:run
   ```

3. **Start Frontend:**
   ```bash
   cd frontend
   npm install    # Install dependencies
   npm start      # Start React app
   ```

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **1. "index.html not found" Error:**
```bash
# Make sure public folder exists
ls frontend/public/
# Should show: index.html, favicon.ico, manifest.json
```

#### **2. "Cannot find module" Error:**
```bash
# Delete node_modules and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### **3. "Port already in use" Error:**
```bash
# Kill processes on ports
# Windows:
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# macOS/Linux:
lsof -ti:8080 | xargs kill -9
```

#### **4. Database Connection Error:**
```bash
# Check PostgreSQL is running
# Windows: Check Services
# macOS: brew services list | grep postgresql
# Linux: sudo systemctl status postgresql
```

## 🏗️ Architecture

### Microservices
- **Main System** (8080) - Central orchestration & roster management
- **Flight Info Service** (8081) - Flight data management
- **Pilot Service** (8082) - Pilot information & assignments
- **Cabin Service** (8083) - Cabin crew management
- **Passenger Service** (8084) - Passenger data

### Frontend
- **React App** (3000) - Web interface with Material-UI

### Database
- **PostgreSQL** (5432) - 5 separate databases for each service

## 👤 Default Users

- **Admin:** admin / admin123
- **User:** user / user123

## 📋 Features

- Flight roster creation and management
- Crew assignment and scheduling
- Admin panel for flight and crew management
- Real-time seat mapping
- JWT-based authentication
- Responsive web interface

## 🛠️ Technology Stack

- **Backend:** Spring Boot, Java 17, Maven
- **Frontend:** React 18, Material-UI, Axios
- **Database:** PostgreSQL 12+
- **Authentication:** JWT
- **Architecture:** Microservices
- **Platform Support:** Windows, macOS, Linux
