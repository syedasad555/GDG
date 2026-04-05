@echo off
echo ========================================
echo GDG College Club - Application Startup
echo ========================================
echo.

REM Kill all existing Node processes
echo Killing existing Node processes...
taskkill /IM node.exe /F 2>nul

REM Wait a moment
timeout /t 2 /nobreak

REM Start MongoDB
echo.
echo Starting MongoDB...
start "MongoDB" mongod

REM Wait for MongoDB to start
timeout /t 3 /nobreak

REM Start Backend
echo.
echo Starting Backend (Port 5000)...
start "Backend" cmd /k "cd backend && npm run dev"

REM Wait for Backend to start
timeout /t 5 /nobreak

REM Start Frontend
echo.
echo Starting Frontend (Port 3000)...
start "Frontend" cmd /k "cd frontend && npm start"

echo.
echo ========================================
echo ✅ Application Started!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Press any key to close this window...
pause
