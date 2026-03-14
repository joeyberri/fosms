@echo off
setlocal
echo =======================================================
echo          FOSMS Project Setup Script
echo =======================================================

:: Check for Node.js and npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js/npm is not installed or not in PATH.
    echo Please download and install Node.js from https://nodejs.org/
    echo Then run this script again.
    pause
    exit /b 1
)

:: Check for Docker
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Docker is not installed or not in PATH.
    echo Please install Docker Desktop from https://www.docker.com/products/docker-desktop
    echo Start Docker Desktop and try again.
    pause
    exit /b 1
)

:: Handle Environment Variables
echo Setting up environment variables...
if not exist ".env" (
    if exist ".env.example" (
        copy ".env.example" ".env" >nul
        echo Configured root .env
    )
)

if not exist "apps\backend\.env" (
    if exist ".env" (
        if not exist "apps\backend" mkdir apps\backend
        copy .env "apps\backend\.env" >nul
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
    if %ERRORLEVEL% NEQ 0 (
        echo [WARNING] Seeding failed, but continuing...
    )
)

echo =======================================================
echo          Setup Complete!
echo =======================================================
echo You can now run start.bat to start the project or db.bat to view the database.
pause
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
