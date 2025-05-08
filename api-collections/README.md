
# Money Flow Guardian API Collections

This directory contains API collections for testing the Money Flow Guardian application APIs.

## Available Collections

1. **Postman Collection**
   - Located at: `./Money_Flow_Guardian_API.postman_collection.json`
   - Import this file into Postman to test the APIs

2. **Bruno Collection**
   - Located at: `./bruno/Money Flow Guardian API Collection/`
   - Use this with Bruno API Client (https://www.usebruno.com/)

## Setting Up

### Postman Setup

1. Import the collection file into Postman
2. Create an environment with the following variables:
   - `baseUrl`: The base URL for the API (e.g., `http://localhost:8080`)
   - `authToken`: JWT token for authenticated requests

### Bruno Setup

1. Open Bruno API Client
2. Open the folder `./bruno/Money Flow Guardian API Collection/`
3. Select the "local" environment

## Authentication

Most endpoints require authentication. The API uses JWT tokens for authentication:

1. Use the `/api/auth/login` endpoint to obtain a token
2. If two-factor authentication is enabled, use the `/api/auth/two-factor` endpoint
3. Set the token in the `authToken` environment variable
4. All authenticated requests will automatically include the token

## Testing Notes

- The API endpoints in these collections are based on the documented API structure
- In the current implementation, these are simulated client-side services
- For a production deployment with real API endpoints, update the base URL accordingly

## Available API Endpoints

The collections include endpoints for:

- Authentication (login, logout, 2FA)
- Family Members (CRUD operations)
- Investments (stocks, gold, fixed deposits, SIPs)
- Financial Goals
- Reports & Analytics
- Audit Trails

For detailed information on each endpoint, refer to the API documentation in `docs/api/README.md`
