# SIP Module PostgreSQL Implementation

## Overview

The SIP (Systematic Investment Plan) module has been updated to use PostgreSQL for data storage when enabled in the environment. This implementation properly integrates with the existing database connection setup in the application.

## Changes Made

1. **API Implementation (`src/api/sipInvestments.js`)**:
   - Updated CRUD operations to use the global database connection from Express app
   - Added proper checks for database availability
   - Maintained error handling for when PostgreSQL is not available

2. **Service Layer (`src/services/sipService.ts`)**:
   - Added compatibility with the PostgreSQL enablement check
   - Implemented proper fallbacks when PostgreSQL is not available
   - Improved error handling for database operations

3. **Database Service (`src/services/db/sipDbService.ts`)**:
   - Updated to use the standard database connector
   - Maintained consistency with other database services

## Benefits

1. **Consistency**: SIP-related data is stored in PostgreSQL when enabled, consistent with other modules.
2. **Reliability**: Proper error handling when PostgreSQL is not available.
3. **Integration**: Proper integration with the global database connection setup.

## Usage Notes

- The SIP module now requires PostgreSQL to be enabled for full functionality.
- Docker environment will automatically enable PostgreSQL as configured in docker-compose.yml.
- Database migrations should be applied using the `migrate-postgres.sh` script before using the SIP module.
