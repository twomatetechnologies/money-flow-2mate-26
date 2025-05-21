
# Getting Started with Money Flow Guardian

This guide will help you set up and run the Money Flow Guardian application on your local machine.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your system
- (Optional) [Docker Compose](https://docs.docker.com/compose/install/) for easier container management
- (Optional for development) [Node.js & npm](https://github.com/nvm-sh/nvm#installing-and-updating) if running locally

## Installation Options

### 1. Using Docker (Recommended)

Money Flow Guardian can be run with or without PostgreSQL:

#### With PostgreSQL (Persistent Data)

```bash
# Start the application with PostgreSQL enabled
POSTGRES_ENABLED=true docker-compose up -d
```

This will:
- Start the web application on http://localhost:8080
- Start a PostgreSQL database container
- Set up data persistence in the `./data` directory and a Docker volume

#### Without PostgreSQL (File-Only Mode)

```bash
# Start the application without PostgreSQL
POSTGRES_ENABLED=false docker-compose up -d
```

### 2. Using Convenience Scripts

For Windows users:
```bash
# Start the application
run-app.bat

# Stop the application
stop-app.bat
```

For Unix/Linux/Mac users:
```bash
# Start the application
./run-app.sh

# Stop the application
./stop-app.sh
```

### 3. Local Development Setup

If you prefer to develop directly on your machine:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Docker Components

The Dockerized application consists of:

1. **Web Application Container**
   - Built on Node.js with Nginx as the web server
   - Exposes port 8080 for web access
   - Mounts a volume for data persistence

2. **PostgreSQL Container** (Optional)
   - Runs PostgreSQL 15 for data storage
   - Exposes port 5432 for database connections
   - Stores data in a named Docker volume

## Configuration Options

### Environment Variables

The following environment variables can be used to customize the deployment:

| Variable | Description | Default |
|----------|-------------|---------|
| POSTGRES_ENABLED | Enable/disable PostgreSQL | true |
| POSTGRES_HOST | Database hostname | db |
| POSTGRES_PORT | Database port | 5432 |
| POSTGRES_DB | Database name | financeapp |
| POSTGRES_USER | Database username | postgres |
| POSTGRES_PASSWORD | Database password | postgres123 |

### Docker Compose Customization

You can modify the `docker-compose.yml` file to:
- Change port mappings
- Adjust environment variables
- Add additional services
- Configure volume mounts

## User Registration

To use the application, you'll need to register a new account. The application doesn't come with any pre-configured users.

## Data Persistence

- When using PostgreSQL: Data is stored in a Docker volume named `postgres_data`
- Without PostgreSQL: Data is stored in browser's localStorage

## Database Migrations

The application runs database migrations automatically when starting with PostgreSQL enabled. 
These migrations:
- Create necessary database tables if they don't exist
- Set up initial data for family members, goals, and other entities

## Next Steps

- Explore the [User Guide](./user-guide/README.md) to learn about application features
- Check the [Development Guide](./development-guide.md) if you want to contribute to the project
