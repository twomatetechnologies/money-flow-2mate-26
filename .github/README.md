
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

## Getting Started

### Using Docker (Recommended)

```bash
# Run with PostgreSQL (persistent data)
POSTGRES_ENABLED=true docker-compose up -d

# Or without PostgreSQL (file-only mode)
POSTGRES_ENABLED=false docker-compose up -d
```

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Documentation

For detailed information, please see:

- [User Guide](./docs/user-guide/README.md)
- [API Documentation](./docs/api/README.md)
- [Development Guide](./docs/development-guide.md)
- [Architecture Overview](./docs/architecture.md)

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

