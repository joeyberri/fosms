@echo off
setlocal
echo =======================================================
echo          Starting FOSMS Project
echo =======================================================

:: Check for Node.js and npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js/npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Start backend in a new command window
echo Starting backend server...
start "FOSMS Backend" cmd /k "npm run backend:dev"

:: Wait a moment
timeout /t 2 /nobreak >nul

:: Start frontend in a new command window
echo Starting frontend server...
start "FOSMS Frontend" cmd /k "npm run frontend:dev"

echo =======================================================
echo          Project Started!
echo =======================================================
echo Backend and Frontend are running in separate windows.
echo Close the windows to stop the servers.
pause