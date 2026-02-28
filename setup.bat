@echo off
setlocal
echo =======================================================
echo          FOSMS Project Setup and Run Script
echo =======================================================

:: Check for Git
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Git is not installed or not in PATH.
    echo Please install Git and try again.
    pause
    exit /b 1
)

:: Check for Node.js
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js and try again.
    pause
    exit /b 1
)

:: Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop, start it, and try again.
    pause
    exit /b 1
)

:: Clone or Enter Repo
if exist "package.json" (
    echo Found package.json. Assuming we are inside the project folder.
) else (
    echo Cloning the project repository...
    git clone https://github.com/Sairyss/fullstack-starter-template.git fosms-app
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Git clone failed. Check your internet connection or git installation.
        pause
        exit /b 1
    )
    cd fosms-app
)

:: Handle Environment Variables
echo Setting up environment variables...
if not exist ".env" (
    if exist ".env.example" (
        copy .env.example .env >nul
        echo Configured root .env
    )
)

if not exist "apps\backend\.env" (
    if exist ".env" (
        if not exist "apps\backend" mkdir apps\backend
        copy .env apps\backend\.env >nul
        echo Configured backend .env
    )
)

:: NPM Install
echo Installing dependencies... (This may take a few minutes)
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

:: Docker up
echo Starting Database Docker container...
call docker compose -f docker\docker-compose.yaml up -d
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start Docker container. Make sure Docker Desktop is open!
    pause
    exit /b 1
)

:: Adding wait time for db startup
echo Waiting for the database to accept connections...
timeout /t 5 /nobreak >nul

:: Database Migration
echo Running database migrations...
call npm run migrate:dev
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database migration failed.
    echo You may need to restart the script after Docker finishes starting.
    pause
    exit /b 1
)

:: Seeding Data
if exist "apps\backend\seed.js" (
    echo Seeding database...
    node apps\backend\seed.js
)

:: Starting App
echo =======================================================
echo          Setup Complete! Application is starting...     
echo =======================================================
echo Local apps should open in your browser or be available at:
echo Frontend: Varies based on Vite config, usually http://localhost:4200
echo Backend:  http://localhost:3000
echo.
echo Leave this window open to keep servers running!
echo To shut down, press Ctrl+C multiple times in this window.

:: Actually start the Nx dev server
call npm run start:dev

pause
