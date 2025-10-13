@echo off
echo Starting Flight Info Service...
echo Port: 8081
echo Database: flight_info_db
echo.
mvn spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
pause




