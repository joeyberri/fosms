@echo off
setlocal
echo =======================================================
echo          FOSMS Project Setup Script
echo =======================================================

:: Check for Node.js and npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js not found. Downloading and installing Node.js...
    powershell -Command "try { Invoke-WebRequest -Uri 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi' -OutFile '$env:TEMP\nodejs.msi'; Start-Process msiexec.exe -ArgumentList '/i', '$env:TEMP\nodejs.msi', '/quiet', '/norestart' -Wait; } catch { echo Failed to download/install Node.js. Please install manually from https://nodejs.org/; pause; exit /b 1 }"
    :: Update PATH for this session
    set PATH=%PATH%;C:\Program Files\nodejs
    :: Check again
    where npm >nul 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo [ERROR] Node.js installation failed. Please install Node.js manually.
        pause
        exit /b 1
    )
    echo Node.js installed successfully.
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

:: Database Migration (SQLite, no server needed)
echo Running database migrations...
call npm run migrate:dev
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database migration failed.
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
echo To shut down, press Ctrl+C multiple times in this window.

:: Actually start the Nx dev server
call npm run start:dev

pause
