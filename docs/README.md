
# Money Flow Guardian - Documentation

## Introduction

Money Flow Guardian is a comprehensive personal finance management application designed to help users track their investments, financial goals, and overall net worth. This documentation provides detailed information about the application's features, architecture, and APIs.

## Table of Contents

1. [Getting Started](./getting-started.md)
2. [Features Overview](./features/README.md)
3. [Architecture](./architecture.md)
4. [API Documentation](./api/README.md)
5. [User Guide](./user-guide/README.md)
6. [Development Guide](./development-guide.md)
7. [Version Management](./version-management.md)
8. [Security Features](./user-guide/security.md)

## Quick Overview

Money Flow Guardian helps users track various investment types including:

- Stocks
- Fixed Deposits
- Systematic Investment Plans (SIPs)
- Gold Investments
- Provident Funds
- Insurance Policies

The application calculates net worth, provides financial health scores, and offers personalized recommendations based on the user's financial data.

## Technology Stack

- React.js with TypeScript
- Tailwind CSS for styling
- Shadcn/UI component library
- Chart.js for data visualization
- Local storage for data persistence (non-production)

For detailed technical information, please refer to the [Architecture](./architecture.md) documentation.

## Key Features

### Dashboard
The dashboard provides a comprehensive overview of your financial status with net worth breakdowns, asset allocation charts, and personalized recommendations.

### Investment Tracking
Track various investment types with detailed information about each investment, including purchase price, current value, returns, and more.

#### Stock Portfolio
The Stock Portfolio module allows users to:
- Track individual stock holdings across family members
- Sort any column in the table by clicking on the column header
- Filter stocks by multiple criteria:
  - Performance (gainers/losers)
  - Price range
  - Value range
  - Sector
  - Text search across symbol and name
- View real-time (or simulated) market data
- Calculate gains/losses for each investment
- Import/export stock data in CSV or Excel format
- View audit history for each stock transaction

### Financial Goals
Set and track financial goals with visual progress indicators and recommendations for achieving your targets.

### Family Management
Manage finances for multiple family members with separate profiles and consolidated reporting.

### Reports & Analytics
Generate insights from your financial data with detailed reports and visualizations.

### Security
Protect your sensitive financial information with two-factor authentication and comprehensive audit trails.

## Deployment Options

### Docker Containerization
The application is fully containerized with Docker, allowing for easy deployment in any environment. 

### Database Options
- **PostgreSQL Mode**: Full database persistence with automatic migrations
- **File-Only Mode**: Uses localStorage for simpler deployments

## Getting Started

See the [Getting Started](./getting-started.md) guide for detailed instructions on installing and running the application.

## For Developers

If you're looking to contribute to the project or extend its functionality, please see the [Development Guide](./development-guide.md).

## Version Management

The application uses semantic versioning with automatic version incrementing. See [Version Management](./version-management.md) for details.
