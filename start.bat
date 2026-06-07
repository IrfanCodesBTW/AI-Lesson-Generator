@echo off
title AI Lesson Generator
echo ===================================================
echo           Starting AI Lesson Generator
echo ===================================================
echo.
echo Launching Backend Server (Port 4000)...
start "Backend Server" cmd /k "npm run dev:backend"

echo Launching Frontend Server (Port 5173)...
start "Frontend Server" cmd /k "npm run dev:frontend"

echo.
echo ===================================================
echo  Both services are starting up.
echo  - Backend: http://localhost:4000
echo  - Frontend: http://localhost:5173
echo ===================================================
pause
