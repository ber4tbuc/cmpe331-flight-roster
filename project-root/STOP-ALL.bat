@echo off
echo Stopping all services...

taskkill /f /im java.exe
taskkill /f /im node.exe

echo All services stopped!
pause