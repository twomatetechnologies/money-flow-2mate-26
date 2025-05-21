
# Money Flow Guardian Docker Setup Guide

This guide explains how to run different components of the Money Flow Guardian application separately or together using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed on your system

## Running Components Individually

### Database and pgAdmin Only

This will start PostgreSQL and pgAdmin without the application or API.

```bash
# On Linux/Mac
./run-db.sh

# On Windows
run-db.bat
```

- PostgreSQL will be available on `localhost:5432`
- pgAdmin will be available at `http://localhost:5050`
  - Email: `pg.admin@example.com` 
  - Password: `admin123`

### API Server Only

This will start the API server (requires the database to be running).

```bash
# On Linux/Mac
./run-api.sh

# On Windows
run-api.bat
```

- API will be available at `http://localhost:8081`

### Frontend App Only

This will start the frontend application (requires the API and database to be running).

```bash
# On Linux/Mac
docker-compose -f docker-compose.app.yml up -d

# On Windows
docker-compose -f docker-compose.app.yml up -d
```

- Frontend will be available at `http://localhost:8080`

## Running API Locally for Debugging

To run the API server locally outside Docker for debugging in VS Code:

```bash
# On Linux/Mac
./run-api-local.sh

# On Windows
run-api-local.bat
```

Alternatively, you can use the VS Code debugger:

1. Open the project in VS Code
2. Go to the "Run and Debug" tab
3. Select "Debug API Server" from the dropdown
4. Press F5 or click the green play button

This will start the API server with full debugging support in VS Code.

## Running Everything Together

To run all components (database, pgAdmin, API, and frontend) together:

```bash
# On Linux/Mac
docker-compose up -d

# On Windows
docker-compose up -d
```

## Stopping Services

To stop individual services:

```bash
# Database and pgAdmin
docker-compose -f docker-compose.db.yml down

# API
docker-compose -f docker-compose.api.yml down

# Frontend
docker-compose -f docker-compose.app.yml down
```

To stop all services:

```bash
docker-compose down
```

## Viewing Logs

To view logs for a specific service:

```bash
# Database
docker logs money-flow-guardian-db -f

# pgAdmin
docker logs money-flow-guardian-pgadmin -f

# API
docker logs money-flow-guardian-api -f

# Frontend
docker logs money-flow-guardian-app -f
```
