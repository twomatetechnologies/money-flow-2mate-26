
# Development Guide

This document provides information for developers who wish to contribute to or extend the Money Flow Guardian application.

## Development Environment Setup

### Prerequisites

- Node.js 16.0.0 or higher
- npm 7.0.0 or higher
- Git

### Setup Steps

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-flow-guardian.git
   cd money-flow-guardian
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```
   
4. To build the application:
   ```bash
   npm run build
   ```

## Project Structure

```
├── public/             # Static assets
├── src/                # Source code
│   ├── components/     # React components
│   ├── constants/      # Application constants
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utility libraries
│   ├── pages/          # Page components
│   ├── services/       # Business logic
│   ├── types/          # TypeScript definitions
│   └── utils/          # Utility functions
├── docs/               # Documentation
└── tests/              # Test files
```

## Coding Standards

### General Guidelines

- Follow the TypeScript best practices
- Use functional components with hooks
- Separate business logic from UI components
- Document public functions and complex logic
- Write unit tests for business logic

### Component Structure

Components should follow this structure:
```tsx
import React from 'react';
import { someUtil } from '@/utils/someUtil';
import { SomeType } from '@/types';

interface ComponentProps {
  prop1: string;
  prop2: number;
}

export const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // Component logic
  
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
};

export default Component;
```

### State Management

- Use React Context for global state
- Use React Query for server state
- Use local state for component-specific state

## Adding New Features

### New Investment Type

1. Create TypeScript interface in `src/types/index.ts`
2. Create a service file in `src/services/`
3. Create UI components in `src/components/`
4. Add a page component in `src/pages/`
5. Update the sidebar navigation in `src/components/layout/Sidebar.tsx`

### Adding a New Service

Create a new service file in `src/services/` following the pattern:

```typescript
import { v4 as uuidv4 } from 'uuid';
import { EntityType } from '@/types';
import { createAuditRecord } from './auditService';

// In-memory datastore
let entities: EntityType[] = [];

export const getEntities = (): Promise<EntityType[]> => {
  return Promise.resolve([...entities]);
};

export const createEntity = (entity: Omit<EntityType, 'id'>): Promise<EntityType> => {
  const newEntity: EntityType = {
    ...entity,
    id: uuidv4()
  };
  
  entities.push(newEntity);
  createAuditRecord(newEntity.id, 'entityType', 'create', newEntity);
  return Promise.resolve(newEntity);
};

// Additional CRUD operations...
```

## Extending the Application

### Adding New Dashboard Widgets

1. Create a new component in `src/components/dashboard/`
2. Add required data fetching and business logic
3. Import and add to the Dashboard layout in `src/pages/Dashboard.tsx`

### Adding Report Types

1. Create a new report generator in `src/services/reportsDataService.ts`
2. Add UI components for the report in `src/components/reports/`
3. Update the Reports page in `src/pages/Reports.tsx`

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- ComponentName.test.tsx
```

### Writing Tests

- Place test files next to the code they test
- Use descriptive test names
- Mock external dependencies
- Test user interactions using React Testing Library

## Building and Deployment

### Building for Production

```bash
npm run build
```

### Docker Deployment

```bash
# Build the Docker image
docker build -t money-flow-guardian .

# Run the container
docker run -p 8080:80 money-flow-guardian
```

## Version Management

See [Version Management](./version-management.md) for details on how versioning is handled in the application.

