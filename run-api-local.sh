
#!/bin/bash

# Make this script executable
chmod +x "${0}"

echo "Starting Money Flow Guardian API locally for debugging..."

# Set environment variables
export NODE_ENV=development
export POSTGRES_ENABLED=true
export POSTGRES_HOST=localhost
export POSTGRES_PORT=5432
export POSTGRES_DB=financeapp
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=postgres123
export API_PORT=8081

# Run the API server locally
node start-bruno-api.cjs
