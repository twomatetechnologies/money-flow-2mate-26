
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

### 2. Local Development Setup

If you prefer to develop directly on your machine:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Default Login Credentials

For the demo version, use these credentials:
- Email: `user@example.com`
- Password: `password`

## Data Persistence

- When using PostgreSQL: Data is stored in a Docker volume named `postgres_data`
- Without PostgreSQL: Data is stored in browser's localStorage

## Next Steps

- Explore the [User Guide](./user-guide/README.md) to learn about application features
- Check the [Development Guide](./development-guide.md) if you want to contribute to the project

