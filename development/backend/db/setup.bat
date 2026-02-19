@echo off
REM ============================================================
REM SeatsLabs Database Setup Script for Windows
REM PURPOSE: Automated database creation and schema setup
REM ============================================================

echo ============================================================
echo SeatsLabs Database Setup
echo ============================================================
echo.

REM Check if PostgreSQL is installed
where psql >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PostgreSQL is not installed or not in PATH
    echo Please install PostgreSQL first: https://www.postgresql.org/download/
    pause
    exit /b 1
)

echo [1/4] Checking PostgreSQL installation...
psql --version
echo.

REM Get database credentials
set /p DB_USER="Enter PostgreSQL username (default: postgres): " || set DB_USER=postgres
set /p DB_PASSWORD="Enter PostgreSQL password: "
echo.

echo [2/4] Creating database 'seatslabs'...
psql -U %DB_USER% -c "DROP DATABASE IF EXISTS seatslabs;"
psql -U %DB_USER% -c "CREATE DATABASE seatslabs;"

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to create database
    pause
    exit /b 1
)
echo Database created successfully!
echo.

echo [3/4] Running seatslabs_db.sql...
psql -U %DB_USER% -d seatslabs -f seatslabs_db.sql

if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to execute schema
    pause
    exit /b 1
)
echo Schema created successfully!
echo.

echo [4/4] Verifying installation...
psql -U %DB_USER% -d seatslabs -c "SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';"
echo.

echo ============================================================
echo Database Setup Complete!
echo ============================================================
echo.
echo Database Name: seatslabs
echo Tables Created: 18
echo Seed Data: Loaded
echo.
echo Next Steps:
echo 1. Update your .env file with database credentials
echo 2. Start the backend server: npm run dev
echo 3. Access API docs: http://localhost:5000/api-docs
echo.
echo Default Admin Login:
echo Email: admin@seatslabs.com
echo Password: admin123
echo.
echo ============================================================
pause
