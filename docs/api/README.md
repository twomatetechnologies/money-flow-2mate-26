
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

