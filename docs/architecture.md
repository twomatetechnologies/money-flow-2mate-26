
# Architecture Overview

## Application Structure

Money Flow Guardian follows a component-based architecture using React with TypeScript. The application is structured as follows:

```
src/
├── components/     # UI components organized by feature
│   ├── auth/       # Authentication components
│   ├── common/     # Shared/reusable components
│   ├── dashboard/  # Dashboard-specific components
│   ├── layout/     # Layout components (sidebar, footer, etc.)
│   └── ui/         # Base UI components from shadcn/ui
├── contexts/       # React contexts for state management
├── hooks/          # Custom React hooks
├── pages/          # Page components that represent routes
├── services/       # Business logic and data access
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

## Data Flow

1. **User Interface Layer**: Components in `pages/` and `components/`
2. **Application Logic Layer**: Services in `services/`
3. **Data Persistence Layer**: Local storage (for the demonstration version)

## State Management

The application uses React's Context API for global state management:

- `AuthContext`: Manages user authentication state
- `SettingsContext`: Manages user preferences and settings

## Service Layer

The service layer acts as an abstraction over the data storage:

- Each investment type has its own service (e.g., `stockService.ts`, `goldService.ts`)
- Services handle CRUD operations and business logic
- In a production environment, these services would connect to backend APIs

## Data Persistence

The demonstration version uses:

- `localStorage` for client-side data persistence
- Simulated delay to mimic API calls
- Mock data for initial application state

In a production environment, this would be replaced with:

- REST API calls to a backend service
- PostgreSQL database (configured in Docker setup)

## Authentication

The application implements:

- Basic email/password authentication
- Two-factor authentication (simulated)
- Session management

## Diagrams

### High-level Architecture

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  UI Layer     │     │  Service      │     │  Persistence  │
│  (React       │────>│  Layer        │────>│  Layer        │
│   Components) │     │  (TypeScript) │     │  (localStorage)│
└───────────────┘     └───────────────┘     └───────────────┘
```

### Component Dependencies

```
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  Pages        │────>│  Components   │────>│  UI Library   │
└───────────────┘     └───────────────┘     │  (shadcn/ui)  │
                              │             └───────────────┘
                              ▼
┌───────────────┐     ┌───────────────┐
│  Contexts     │<────│  Services     │
└───────────────┘     └───────────────┘
```

## Security Considerations

- Auth state is maintained in memory and localStorage
- 2FA implementation is simulated (see [2FA Implementation](./docs/2FA_Implementation.md))
- In production, proper authentication with JWT or OAuth would be implemented
- Sensitive data would be encrypted both in transit and at rest

