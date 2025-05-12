
@echo off
echo Starting Money Flow Guardian API server...
docker-compose -f docker-compose.api.yml up -d

echo.
echo API is running on http://localhost:8081
