@echo off
setlocal
echo =======================================================
echo          Opening Prisma Studio
echo =======================================================

:: Check for Node.js and npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js/npm is not installed or not in PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if .env exists
if not exist ".env" (
    echo [ERROR] .env file not found. Please run setup.bat first.
    pause
    exit /b 1
)

:: Open Prisma Studio
echo Opening Prisma Studio to view database tables...
npx prisma studio

echo Prisma Studio closed.
pause