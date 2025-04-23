
@echo off
echo Starting Money Flow Guardian Application...

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo Docker is not running. Please start Docker and try again.
    pause
    exit /b 1
)

REM Build and start the containers
echo Building and starting containers...
docker-compose up --build -d

if %errorlevel% neq 0 (
    echo Failed to start containers. Please check the error message above.
    pause
    exit /b 1
)

echo.
echo Application is starting...
echo You can access it at http://localhost:8080
echo.
echo Press Ctrl+C to view logs or close this window to keep running in background
echo.

REM Show logs
docker-compose logs -f
