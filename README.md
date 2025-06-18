# Money Flow Guardian - Lovable Project

This comprehensive guide helps you get your personal finance app running with Docker, supporting both PostgreSQL database (via Docker) and file-only (no database) modes.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Installation](#installation)
   - [Prerequisites](#prerequisites)
   - [Docker Setup (Recommended)](#docker-setup-recommended)
   - [Local Development Setup](#local-development-setup)
4. [Database Options](#database-options)
   - [PostgreSQL Configuration](#postgresql-configuration)
   - [Database Migrations](#database-migrations)
5. [Usage](#usage)
   - [Default Login](#default-login)
   - [Two-Factor Authentication](#two-factor-authentication)
6. [AI Integration](#ai-integration)
   - [Current Implementation](#current-implementation)
   - [Supported AI Providers](#supported-ai-providers)
   - [Configuration](#configuration)
7. [Documentation](#documentation)
8. [Troubleshooting](#troubleshooting)
9. [Version Management](#version-management)
10. [Contributing](#contributing)

---

## Overview

Money Flow Guardian is a comprehensive personal finance management application designed to help users track their investments, financial goals, and overall net worth. The application provides intuitive dashboards, detailed tracking for various investment types, and family finance management capabilities.

## Features

- **Investment Tracking**: Stocks, Gold, Fixed Deposits, SIPs, Provident Funds, Insurance
- **Financial Dashboard**: Net worth breakdown, asset allocation, health score
- **Goal Management**: Create and track financial goals with visual progress indicators
- **Family Accounts**: Manage finances for multiple family members with separate profiles
- **Data Import/Export**: CSV and Excel support for all investment types
- **Reports & Analytics**: Performance analysis and financial insights
- **Two-Factor Authentication**: Enhanced security for personal data
- **Dockerized Deployment**: Easy setup with Docker and Docker Compose
- **Database Support**: PostgreSQL integration for persistent data storage
- **Robust Stock Price Updates**: Multiple API providers with automatic fallback mechanism

---

## Installation

### Prerequisites

- [Docker installed](https://docs.docker.com/get-docker/)
- (Optional) [Docker Compose plugin](https://docs.docker.com/compose/)
- (Optional for development) [Node.js & npm if running locally](https://github.com/nvm-sh/nvm#installing-and-updating)

### Docker Setup (Recommended)

You can run the app with or without PostgreSQL. By default, the database runs in a Docker container for persistent data.

#### **A. Running with PostgreSQL enabled (Recommended)**

> The PostgreSQL container is used as a backend for persistent data storage.

**Step 1: Start the app (and DB) via Docker Compose**

```sh
# PostgreSQL will be enabled and running
POSTGRES_ENABLED=true docker-compose up -d
```
- The web app will be on [http://localhost:8080](http://localhost:8080).
- A PostgreSQL DB will be available (internal network).

**Step 2: Data Persistence**

- App data and localStorage will persist in `./data` (host).
- DB data will persist in `postgres_data` Docker volume.

**Step 3: Stop the app**
```sh
docker-compose down
```

#### **B. Running without PostgreSQL**

1. Edit `docker-compose.yml` and comment out the entire `db:` service block.
2. Or set the variable (though Compose v3 doesn't fully disable services by env):

```sh
POSTGRES_ENABLED=false docker-compose up -d
```
_Note: The app may require an active DB for all functionality._

### Local Development Setup

If you prefer to develop directly on your machine:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Database Options

### PostgreSQL Configuration

Default DB connection details can be changed in `docker-compose.yml`:
```yaml
POSTGRES_DB=financeapp
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres123
POSTGRES_HOST=db
```

### Database Migrations

On container start, the app runs `migrate-postgres.sh` to ensure required tables exist in the PG database.

- To customize schema, edit `migrate-postgres.sh`.
- Example table creation is included for reference only.
- The script automatically creates:
  - Family members table
  - Financial goals table
  - Investment tables (stocks, gold, fixed deposits, etc.)
  - Audit trail table

## Usage

### Authentication

The application requires user registration and authentication to access the dashboard. Users must create an account before logging in.

### Two-Factor Authentication

The application includes a simulated two-factor authentication system:

- The system will prompt for a verification code after login
- For demonstration purposes, any 6-digit code is accepted
- In production, this would be integrated with email or SMS services

See [Security Features](./docs/user-guide/security.md) for detailed implementation information.

## AI Integration

### Current Implementation

Money Flow Guardian integrates with AI services to provide personalized financial insights and answer user queries. The application leverages AI capabilities for:

1. **Personalized Financial Insights**: Analyzes your portfolio to identify opportunities, anomalies, and recommendations.
2. **Natural Language Queries**: Allows you to ask questions about your finances in plain language.
3. **Goal Planning Assistance**: Recommends strategies to help you meet your financial goals.

### Supported AI Providers

The application is designed with a flexible AI integration system that currently supports:

1. **Local Ollama**: Default configuration connects to a locally running Ollama instance (http://localhost:11434) for privacy-focused processing without sending data to third-party services.
2. **Generic LLM API**: The architecture supports connecting to any LLM service that follows standard completion API formats.

### Configuration

#### Setting Up Ollama (Default)

1. **Install Ollama**:
   - Visit [Ollama's website](https://ollama.ai) for installation instructions
   - Or use Docker: `docker run -d -p 11434:11434 --name ollama ollama/ollama`

2. **Model Requirements**:
   - Default model: llama3 (can be changed in `src/hooks/useOllama.ts`)
   - Recommended: Install models with financial knowledge

3. **Configuration**:
   ```javascript
   // Update in src/hooks/useOllama.ts
   const defaultOptions = {
     model: 'llama3', // Change to your preferred model
     temperature: 0.7,
     topP: 0.9,
     maxTokens: 1000,
   };
   ```

#### Using Alternative AI Providers

The application uses a provider-agnostic approach through the `useAIProvider` hook:

1. **Configure Provider Endpoint and Authentication**:
   - Update AI provider settings in the application settings page
   - Or modify the environment variable `AI_PROVIDER_URL`

2. **API Key Management**:
   - Store your API key securely (not directly in code)
   - In development: Use environment variables
   - In production: Use secrets management

3. **Custom AI Providers**:
   To implement a custom AI provider, create an adapter that implements the `AIProvider` interface:

   ```typescript
   // Example implementation for a custom provider
   export class CustomAIProvider implements AIProvider {
     async generateText(prompt: string, systemPrompt?: string, options?: any): Promise<string> {
       // Implementation specific to your AI provider
       // ...
     }
   }
   ```

### Best Practices

1. **Data Privacy**: Consider which data is sent to AI services and inform users
2. **Error Handling**: Implement graceful fallbacks when AI services are unavailable
3. **Cost Management**: Monitor API usage and implement rate limiting for external services
4. **Prompt Engineering**: Carefully design prompts for consistent and useful results

### Future Enhancements

The AI integration roadmap includes:
- Support for more AI providers (OpenAI, Anthropic, Mistral AI)
- Fine-tuned models specific to financial analysis
- Local model support for offline operation
- User feedback loop to improve AI responses over time

## Documentation

For detailed documentation about the application, please see the [Documentation](./docs/README.md) directory, which includes:

- [Getting Started](./docs/getting-started.md)
- [Features Overview](./docs/features/README.md)
  - [Stock Price API Integration](./docs/features/stock-price-api-integration.md)
  - [Gold Investments](./docs/features/gold-investments.md)
  - [SIP PostgreSQL Implementation](./docs/features/sip-postgresql-implementation.md)
- [Architecture](./docs/architecture.md)
- [API Documentation](./docs/api/README.md)
- [User Guide](./docs/user-guide/README.md)
- [Development Guide](./docs/development-guide.md)
- [Version Management](./docs/version-management.md)

## Troubleshooting

- If the app doesn't work, check logs using:
  ```sh
  docker-compose logs
  ```
- Ensure ports 8080 (frontend) and 5432 (DB) are available.
- For DB issues, inspect `migrate-postgres.sh`, environment variables, and Docker volumes.
- Common issues and solutions:
  - **Connection refused to PostgreSQL**: Check that the DB container is running
  - **Login failures**: Ensure you're using the correct credentials
  - **Data not persisting**: Verify volume mounts are correctly configured

## Version Management

The application uses semantic versioning (MAJOR.MINOR.PATCH) with automatic version incrementing:

- A pre-commit hook automatically increments the patch version
- Version history is tracked in a changelog
- See [Version Management Guide](./docs/version-management.md) for setup instructions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Lovable Project Online

App URL: https://lovable.dev/projects/d10d97f2-402f-47c1-9500-49c45556eadc

Read more at [Lovable Documentation](https://docs.lovable.dev/)
