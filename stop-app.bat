
@echo off
echo Stopping Money Flow Guardian Application...

REM Stop the containers
docker-compose down

if %errorlevel% neq 0 (
    echo Failed to stop containers. Please check the error message above.
    pause
    exit /b 1
)

echo.
echo Application has been stopped successfully.
pause
