
@echo off
echo Starting Money Flow Guardian API locally for debugging...

REM Set environment variables
set NODE_ENV=development
set POSTGRES_ENABLED=true
set POSTGRES_HOST=localhost
set POSTGRES_PORT=5432
set POSTGRES_DB=financeapp
set POSTGRES_USER=postgres
set POSTGRES_PASSWORD=postgres123
set API_PORT=8081

REM Run the API server locally
node start-bruno-api.cjs
