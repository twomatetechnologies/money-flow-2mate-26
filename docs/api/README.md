
# API Documentation

## Overview

Money Flow Guardian uses a service-based architecture with TypeScript services that simulate API calls. This documentation describes the internal service API structure which could be adapted to a REST API in a production environment.

## Service Endpoints

- [Stock Service](./stock-service.md)
- [Gold Service](./gold-service.md)
- [Fixed Deposit Service](./fixed-deposit-service.md)
- [SIP Investment Service](./sip-investment-service.md)
- [Audit Service](./audit-service.md)
- [Family Service](./family-service.md)
- [Goal Service](./goal-service.md)
- [Net Worth Service](./net-worth-service.md)

## Common Data Models

### Base Investment Model

All investment types extend this base model:

```typescript
interface BaseInvestment {
  id: string;
  familyMemberId: string;
  lastUpdated: Date;
}
```

### Response Format

All service methods return Promises with the following structure:

```typescript
// Success response
Promise<T>

// Error response
Promise.reject(new Error("Error message"))
```

## Authentication

Current implementation uses a simulated authentication process. In a REST API:

- Endpoints would require valid JWT token
- Authorization header format: `Authorization: Bearer <token>`
- Token expiry and refresh mechanisms would be implemented

## Rate Limiting

In a production API, rate limiting would be:
- 100 requests per minute per user
- 429 status code returned when limit exceeded

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid parameters |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Resource doesn't exist |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error |

## API Routes Reference

Below is a comprehensive list of API endpoints that would be implemented in a production REST API:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/two-factor` - Verify 2FA code
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh authentication token

### Family Members
- `GET /api/family` - List all family members
- `POST /api/family` - Create new family member
- `GET /api/family/{id}` - Get single family member
- `PUT /api/family/{id}` - Update family member
- `DELETE /api/family/{id}` - Remove family member

### Investments
- `GET /api/stocks` - List all stocks
- `POST /api/stocks` - Add new stock
- `PUT /api/stocks/{id}` - Update stock
- `DELETE /api/stocks/{id}` - Delete stock
- `GET /api/gold` - List all gold investments
- `POST /api/gold` - Add new gold investment
- `PUT /api/gold/{id}` - Update gold investment
- `DELETE /api/gold/{id}` - Delete gold investment
- Similar endpoints for other investment types (Fixed Deposits, SIPs, etc.)

### Financial Goals
- `GET /api/goals` - List all financial goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/{id}` - Update goal
- `DELETE /api/goals/{id}` - Delete goal
- `GET /api/goals/{id}/progress` - Get goal progress

### Reports
- `GET /api/reports/net-worth` - Get net worth report
- `GET /api/reports/asset-allocation` - Get asset allocation report
- `GET /api/reports/investment-performance` - Get investment performance report
- `POST /api/reports/custom` - Generate custom report

### Audit
- `GET /api/audit` - Get audit logs
- `POST /api/audit/export` - Export audit logs

For detailed information about specific service implementations, please refer to the individual service documentation linked at the top of this page.
