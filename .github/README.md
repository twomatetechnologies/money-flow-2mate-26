
# Money Flow Guardian

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/yourusername/money-flow-guardian)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

A comprehensive personal finance management application that helps users track investments, financial goals, and overall net worth.

![Dashboard Preview](https://via.placeholder.com/800x450?text=Money+Flow+Guardian+Dashboard)

## Features

- **Investment Tracking**: Stocks, Gold, Fixed Deposits, SIPs, Provident Funds
- **Financial Dashboard**: Net worth breakdown, asset allocation, health score
- **Goal Management**: Create and track financial goals
- **Family Accounts**: Manage finances for multiple family members
- **Data Import/Export**: CSV and Excel support for all investment types
- **Reports & Analytics**: Performance analysis and financial insights
- **Two-Factor Authentication**: Enhanced security for personal data
- **Dockerized Deployment**: Easy setup with Docker and Docker Compose
- **Database Support**: PostgreSQL integration with pgAdmin for database management
- **Database Flexibility**: Toggle between PostgreSQL and localStorage storage

## Quick Start

### Using Docker (Recommended)

```bash
# Run with PostgreSQL (persistent data)
POSTGRES_ENABLED=true docker-compose up -d

# Or without PostgreSQL (file-only mode)
POSTGRES_ENABLED=false docker-compose up -d
```

The application will be available at http://localhost:8080
pgAdmin will be available at http://localhost:5050

- pgAdmin default login:
  - Email: `admin@example.com`
  - Password: `admin123`

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
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

### PostgreSQL Administration

The application includes pgAdmin for database administration:
- Accessible at: http://localhost:5050
- Default credentials: admin@example.com / admin123
- To connect to the database server:
  1. Add a new server in pgAdmin
  2. Host name/address: `db` (container name)
  3. Port: `5432`
  4. Database: `financeapp`
  5. Username: `postgres`
  6. Password: `postgres123`

### Database Migrations

On container start, the app runs `migrate-postgres.sh` to ensure required tables exist in the PostgreSQL database.

## Documentation

For detailed information, please see:

- [Getting Started](../docs/getting-started.md)
- [Features Overview](../docs/features/README.md)
- [Architecture Overview](../docs/architecture.md)
- [API Documentation](../docs/api/README.md)
- [User Guide](../docs/user-guide/README.md)
- [Development Guide](../docs/development-guide.md)
- [Version Management](../docs/version-management.md)

## Default Login

For the demo version, use these credentials:
- Email: `user@example.com`
- Password: `password`

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Recharts](https://recharts.org/)
- [Docker](https://www.docker.com/)
- [PostgreSQL](https://www.postgresql.org/)
